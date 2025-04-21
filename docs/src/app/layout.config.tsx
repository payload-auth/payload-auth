import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { source } from '@/lib/source'
import { AlbumIcon, BookOpenCheck, Heart, LayoutTemplate } from 'lucide-react'
import { DocsLayoutProps, type LinkItemType } from 'fumadocs-ui/layouts/docs'
import { Logo } from '@/components/logo'
import { RootToggle } from 'fumadocs-ui/components/layout/root-toggle'
import { cn } from '@/lib/utils'
import Sidebar from '@/components/layout/sidebar'

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */

export const linkItems: LinkItemType[] = [
  {
    icon: <AlbumIcon />,
    text: 'Blog',
    url: '/blog',
    active: 'nested-url'
  },
  {
    text: 'Showcase',
    url: '/showcase',
    icon: <LayoutTemplate />,
    active: 'url'
  },
  {
    text: 'Sponsors',
    url: '/sponsors',
    icon: <Heart />
  },
  {
    type: 'icon',
    url: 'https://github.com/fuma-nama/fumadocs',
    text: 'Github',
    icon: (
      <svg role="img" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
    external: true
  }
]

export const logo = (
  <>
    <Logo className="h-6 w-6" />
  </>
)

export const baseOptions: BaseLayoutProps = {
  // nav: {
  //   title: (
  //     <>
  //       {logo}
  //       <span className="font-medium [.uwu_&]:hidden [header_&]:text-[15px]">Payload Auth</span>
  //     </>
  //   ),
  //   transparentMode: 'top'
  // },
  // links: [...linkItems]
}

export const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
  nav: {
    enabled: false
  },
  links: [linkItems[linkItems.length - 1]],
  sidebar: {
    // tabs: [
    //   {
    //     title: 'Docs',
    //     url: '/docs',
    //     icon: <BookOpenCheck />
    //   },
    //   {
    //     title: 'Better Auth',
    //     url: '/docs/better-auth',
    //     icon: <BookOpenCheck />,
    //     description: 'Better Auth is a popular authentication library for Next.js.'
    //   },
    //   {
    //     title: 'Auth.js',
    //     url: '/docs/authjs',
    //     icon: (
    //       <svg viewBox="0 0 215 32" fill="none" xmlns="http://www.w3.org/2000/svg" height={16} className="text-foreground">
    //         <path fill="currentColor" d="M4 3.75h8.676v24.397H4zm26.783 0h9.219v24.397h-9.216z" />
    //         <path
    //           fill="currentColor"
    //           d="M39.73 3.75v7.862H22.327V3.75zm.271 16.535v7.862H22.327v-7.862zm-17.674-8.676v8.676h-9.651v-8.676zm28.132 12.89V7.46h5.857q3.023 0 4.536 1.103t1.513 3.479q0 1.441-.817 2.424-.791.96-2.209 1.224 1.751.241 2.737 1.367 1.009 1.103 1.009 2.76 0 2.327-1.513 3.505T57.274 24.5zm2.063-9.672h3.791q1.871 0 2.88-.696 1.009-.719 1.009-1.992 0-2.665-3.889-2.665h-3.791zm0 7.657h4.751q1.751 0 2.688-.719.96-.719.96-2.063t-.96-2.089q-.937-.768-2.688-.768h-4.751zm13.804 2.015V7.46h10.703v2.015h-8.64v5.496h8.353v1.969h-8.353v5.545h8.832V24.5zm17.846 0V9.475h-5.305V7.46h12.672v2.015h-5.304V24.5zm13.476 0V9.475h-5.304V7.46h12.672v2.015h-5.304V24.5zm9.132 0V7.46h10.703v2.015h-8.64v5.496h8.353v1.969h-8.353v5.545h8.832V24.5zm14.226 0V7.46h6.456q2.688 0 4.247 1.393t1.559 3.768q0 .983-.407 1.8-.407.791-1.057 1.344t-1.416.768q1.129.192 1.777.911.673.719.791 2.04l.481 5.015h-2.089l-.433-4.8q-.095-1.057-.768-1.559-.648-.504-2.135-.504h-4.943v6.863zm2.063-8.881h4.657q1.559 0 2.473-.791t.911-2.255q0-1.487-.937-2.281-.937-.817-2.711-.817h-4.393zm12.91 2.831v-1.897h7.944v1.897zm9.477 6.049L151.6 7.459h2.783l6.147 17.039h-2.255l-1.705-4.849h-7.153l-1.702 4.849zm4.657-6.863h5.76l-2.88-8.376zm18.801 7.247q-1.969 0-3.433-.768-1.441-.768-2.232-2.184-.768-1.441-.768-3.384V7.436h2.063v11.113q0 2.063 1.129 3.192 1.152 1.129 3.241 1.129 2.063 0 3.192-1.129 1.152-1.129 1.152-3.192V7.437h2.063V18.55q0 1.943-.791 3.384-.768 1.416-2.209 2.184t-3.407.768m13.86-.387V9.475h-5.304V7.46h12.672v2.015h-5.304V24.5zm9.132 0V7.46h2.063v7.465h8.568V7.46h2.063v17.039h-2.063v-7.56h-8.568v7.56zm15.956 0v-2.711h2.711v2.711z"
    //         />
    //       </svg>
    //     ),
    //     description: 'Auth.js is a popular authentication library for Next.js.'
    //   }
    // ]
    component: (
      <div className={cn('[--fd-tocnav-height:36px] md:mr-[268px] xl:[--fd-toc-width:286px] xl:[--fd-tocnav-height:0px]')}>
        <Sidebar />
      </div>
    )
  }

  // sidebar: {
  //   // banner: (
  //   //   <RootToggle
  //   //     options={[
  //   //       {
  //   //         title: 'Folder 1',
  //   //         description: 'Pages in folder 1',
  //   //         url: '/path/to/page-tree-1'
  //   //       },
  //   //       {
  //   //         title: 'Folder 2',
  //   //         description: 'Pages in folder 2',
  //   //         url: '/path/to/page-tree-2'
  //   //       }
  //   //     ]}
  //   //   />
  //   // ),
  //   tabs: {
  //     transform(option, node) {
  //       const meta = source.getNodeMeta(node)
  //       if (!meta) return option

  //       const color = `var(--${meta.file.dirname}-color, var(--color-fd-foreground))`
  //       return {
  //         ...option,
  //         icon: (
  //           <div
  //             className="rounded-md p-1 shadow-lg ring-2 [&_svg]:size-5"
  //             style={
  //               {
  //                 color,
  //                 border: `1px solid color-mix(in oklab, ${color} 50%, transparent)`,
  //                 '--tw-ring-color': `color-mix(in oklab, ${color} 20%, transparent)`
  //               } as object
  //             }>
  //             {node.icon}
  //           </div>
  //         )
  //       }
  //     }
  //   }
  // }
}
