const typeMapping = {
  feat: '🚀 Features',
  fix: '🐛 Bugs',
  chore: '🏠 Chores',
  docs: '📚 Documentation',
  style: '💅 Styles',
  refactor: '♻️ Code Refactoring',
  perf: '⚡ Performance Improvements',
  test: '🧪 Tests',
  build: '📦 Build System',
  ci: '⚙️ CI',
  examples: '📝 Examples',
  ui: '🎨 UI Changes'
}

const GITHUB_API_HOST = 'https://api.github.com'

// A simple transform that returns all commits without filtering.
// Ensures that even chore and other commits types are kept.
function transformCommit(commit) {
  return commit
}

// Enrich commit author data by retrieving the GitHub login via the API,
// using the commit author's email as the key. If commit.author is an object,
// we use only its name (if available) and then append " (@login)"; if no name exists,
// we only append the GitHub username without exposing the email.
async function enrichCommitAuthors(context, headers, owner, repository) {
  const emailCache = new Map()
  await Promise.all(
    context.commitGroups.map(async (group) => {
      await Promise.all(
        group.commits.map(async (commit) => {
          if (!commit.author || !commit.raw || !commit.raw.author || !commit.raw.author.email) return

          const email = commit.raw.author.email.toLowerCase()

          // Determine the original name (if provided) without falling back to email.
          let originalName = ''
          if (typeof commit.author === 'object') {
            originalName = commit.author.name || ''
          } else if (typeof commit.author === 'string') {
            originalName = commit.author
          }
          // If already enriched, skip.
          if (originalName && originalName.includes('(@')) return

          if (emailCache.has(email)) {
            const login = emailCache.get(email)
            if (login) {
              commit.author = originalName ? `${originalName} (@${login})` : `(@${login})`
            }
          } else {
            try {
              const res = await fetch(`${GITHUB_API_HOST}/repos/${owner}/${repository}/commits/${commit.raw.hash}`, { headers })
              if (res.ok) {
                const data = await res.json()
                const login = data.author && data.author.login ? data.author.login : null
                emailCache.set(email, login)
                if (login) {
                  commit.author = originalName ? `${originalName} (@${login})` : `(@${login})`
                }
              } else {
                console.error(`Failed to fetch commit ${commit.raw.hash}: ${res.status} ${res.statusText}`)
                emailCache.set(email, null)
              }
            } catch (error) {
              console.error(`Error fetching commit for email ${email}:`, error)
              emailCache.set(email, null)
            }
          }
        })
      )
    })
  )
}

function updateCommitGroupTitles(context, typeMapping) {
  context.commitGroups.forEach((group) => {
    if (group.commits && group.commits.length > 0) {
      const rawType =
        group.commits.at(0)?.raw && group.commits.at(0)?.raw?.type
          ? group.commits.at(0)?.raw?.type?.toLowerCase()
          : group.commits.at(0)?.type?.toLowerCase()
      if (typeMapping[rawType]) {
        group.title = typeMapping[rawType]
      }
    }
  })
}

function buildContributorSection(context) {
  const contributors = new Set()
  context.commitGroups.forEach((group) => {
    group.commits.forEach((commit) => {
      if (commit.author) contributors.add(commit.author)
    })
  })
  const contributorSection = { title: '🤝 Contributors', commits: [] }
  contributors.forEach((contributor) => {
    contributorSection.commits.push({ subject: contributor, hash: '' })
  })
  return contributorSection
}

// The asynchronous finalizeContext returns a promise (which is supported).
async function finalizeContext(context) {
  if (!context.commitGroups) return context

  updateCommitGroupTitles(context, typeMapping)

  const { owner, repository } = context
  const headers = { Accept: 'application/vnd.github.v3+json' }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
  }

  await enrichCommitAuthors(context, headers, owner, repository)

  const contributorSection = buildContributorSection(context)
  context.commitGroups.push(contributorSection)

  return context
}

/**
 * @type {import('semantic-release').GlobalConfig}
 */
const config = {
  // The `main` branch keeps producing regular releases on the default (latest) dist-tag.
  // Every other branch automatically publishes a prerelease to the `canary` channel/dist-tag.
  branches: [
    'main',
    {
      name: 'canary',
      channel: 'canary',
      prerelease: 'canary'
    }
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          { type: 'docs', scope: 'README', release: 'patch' },
          { type: 'docs', release: 'patch' },
          { type: 'chore', release: 'patch' },
          { type: 'examples', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'ui', release: 'patch' },
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { breaking: true, release: 'major' }
        ],
        parserOpts: { noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'] }
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'angular',
        parserOpts: { noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'] },
        // writerOpts: {
        //   commitsSort: ['subject', 'scope'],
        //   types: Object.entries(typeMapping).map(([type, section]) => ({ type, section })),
        //   commitGroupsSort: 'title',
        //   // commitPartial remains unchanged.
        //   commitPartial:
        //     '*{{#if scope}} **{{scope}}:**{{/if}} {{subject}} {{#if hash}} · {{hash}}{{/if}}\n\n' +
        //     '{{#if references}}, closes{{#each references}} [{{this.issue}}]({{this.issueUrl}}){{/each}}{{/if}}\n\n',
        //   groupBy: 'type',
        //   transform: transformCommit,
        //   finalizeContext
        // }
      }
    ],
    // Use exec to update version and publish FIRST (before GitHub creates the tag)
    // Check if version exists on npm first - skip publish if it does (handles recovery from partial failures)
    // [
    //   '@semantic-release/exec',
    //   {
    //     prepareCmd:
    //       'node -e "const p=require(\'./packages/payload-auth/package.json\');p.version=\'${nextRelease.version}\';require(\'fs\').writeFileSync(\'./packages/payload-auth/package.json\',JSON.stringify(p,null,2)+\'\\n\')"',
    //     publishCmd:
    //       'echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc && cd packages/payload-auth && (npm view payload-auth@${nextRelease.version} version >/dev/null 2>&1 && echo "Version ${nextRelease.version} already published, skipping npm publish" || npm publish --access public --tag ${nextRelease.channel || "latest"})'
    //   }
    // ],
    // [
      '@semantic-release/exec',
      {
        prepareCmd:
          'node -e "const fs=require(\'fs\');const p=JSON.parse(fs.readFileSync(\'./packages/payload-auth/package.json\'));p.version=\'${nextRelease.version}\';fs.writeFileSync(\'./packages/payload-auth/package.json\',JSON.stringify(p,null,2)+\'\\n\')"',
        publishCmd:
          'cd packages/payload-auth && npm publish --access public --provenance --tag ${nextRelease.channel || "latest"}'
      }
    ],
    // [
    //   '@semantic-release/npm',
    //   {
    //     pkgRoot: './packages/payload-auth',
    //     npmPublish: true,
    //   }
    // ],
    // GitHub release runs AFTER npm publish succeeds - creates the tag only when everything worked
    [
      '@semantic-release/github',
      {
        assets: [{ path: 'payload-auth-distribution.zip', label: 'Distribution (zip)' }],
        addReleases: 'bottom',
        successComment: ':tada: This release is now available as `${nextRelease.version}` :tada:',
        failTitle: 'The release workflow has failed',
        failComment: 'The release workflow has failed. Please check the logs for more information.',
        releaseNameTemplate: 'v${nextRelease.version}',
        releasedLabels: ['released'],
        addBranchProtectionRules: false,
        githubAssets: false
      }
    ]
  ]
}

export default config
