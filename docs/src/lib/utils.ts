import { clsx, type ClassValue } from 'clsx'
import type { PageTree } from 'fumadocs-core/server'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

export function kFormatter(num: number) {
  return Math.abs(num) > 999 ? Math.sign(num) * parseFloat((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
}

export function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).replace(',', '')
}

type PageNode = PageTree.Item | PageTree.Folder | PageTree.Separator

export const processPageTree = (tree: PageTree.Root, group: string): PageNode[] => {
  if (!tree?.children) return []

  // If we're in a specific group (like better-auth), find that folder's children
  if (group !== 'docs') {
    const groupFolder = tree.children.find(
      (node: PageNode) => node.type === 'folder' && node.$id?.toLowerCase().includes(group.split('/')[1])
    ) as PageTree.Folder
    if (groupFolder) {
      return processPageTree(groupFolder, group)
    }
    return tree.children
  }

  return tree.children
}
