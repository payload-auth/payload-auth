import { DocLink } from "@/components/layout/sidebar/config";
import { source } from "./source";

export function getPageLinks(path: string, links: DocLink[]) {
  const current_category_index = links.findIndex(
    (x) => x.list.find((x) => x.href === path)!
  )!;
  const current_category = links[current_category_index];
  if (!current_category) return { nextPage: undefined, prevPage: undefined };

  // user's current page.
  const current_page = current_category.list.find((x) => x.href === path)!;

  // the next page in the array.
  let next_page = current_category.list.filter((x) => !x.group)[
    current_category.list
      .filter((x) => !x.group)
      .findIndex((x) => x.href === current_page.href) + 1
  ];
  //if there isn't a next page, then go to next cat's page.
  if (!next_page) {
    // get next cat
    let next_category = links[current_category_index + 1];
    // if doesn't exist, return to first cat.
    if (!next_category) next_category = links[0];

    next_page = next_category.list[0];
    if (next_page.group) {
      next_page = next_category.list[1];
    }
  }
  // the prev page in the array.
  let prev_page = current_category.list.filter((x) => !x.group)[
    current_category.list
      .filter((x) => !x.group)
      .findIndex((x) => x.href === current_page.href) - 1
  ];
  // if there isn't a prev page, then go to prev cat's page.
  if (!prev_page) {
    // get prev cat
    let prev_category = links[current_category_index - 1];
    // if doesn't exist, return to last cat.
    if (!prev_category) prev_category = links[links.length - 1];
    prev_page = prev_category.list[prev_category.list.length - 1];
    if (prev_page.group) {
      prev_page = prev_category.list[prev_category.list.length - 2];
    }
  }

  const pages = source.getPages();
  const next_page2 = pages.find((x) => x.url === next_page.href);
  let prev_page2 = pages.find((x) => x.url === prev_page.href);
  if (path === "/docs/introduction") prev_page2 = undefined;
  return { nextPage: next_page2, prevPage: prev_page2 };
}
