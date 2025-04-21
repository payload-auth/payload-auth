import { DocLink } from "@/types";
import { source } from "./source";

export function getPageLinks(path: string, links: DocLink[]) {
  // Handle single pages
  const singlePage = links.find((link) => link.isSingle && link.href === path);
  if (singlePage) {
    // Find the index of the single page in the overall links array
    const singlePageIndex = links.findIndex(
      (link) => link.isSingle && link.href === path
    );

    // Determine next and previous pages
    const nextCategoryIndex =
      singlePageIndex + 1 < links.length ? singlePageIndex + 1 : 0;
    const prevCategoryIndex =
      singlePageIndex - 1 >= 0 ? singlePageIndex - 1 : links.length - 1;

    let nextPage;
    let prevPage;

    // For next page: if next item is single, use it; otherwise use first non-group item in next category
    if (links[nextCategoryIndex].isSingle) {
      nextPage = links[nextCategoryIndex];
    } else {
      const firstNonGroupItem = links[nextCategoryIndex].list.find(
        (item) => !item.group
      );
      nextPage = firstNonGroupItem;
    }

    // For prev page: if prev item is single, use it; otherwise use last non-group item in prev category
    if (links[prevCategoryIndex].isSingle) {
      prevPage = links[prevCategoryIndex];
    } else {
      const nonGroupItems = links[prevCategoryIndex].list.filter(
        (item) => !item.group
      );
      prevPage = nonGroupItems[nonGroupItems.length - 1];
    }

    const pages = source.getPages();
    const nextPage2 = nextPage
      ? pages.find((x) => x.url === (nextPage.href || nextPage.href))
      : undefined;
    const prevPage2 = prevPage
      ? pages.find((x) => x.url === (prevPage.href || prevPage.href))
      : undefined;

    return {
      nextPage: nextPage2,
      prevPage: path === "/docs/introduction" ? undefined : prevPage2,
    };
  }

  // Handle regular category pages
  const current_category_index = links.findIndex(
    (x) => x.list && x.list.find((x) => x.href === path)
  );

  if (current_category_index === -1)
    return { nextPage: undefined, prevPage: undefined };

  const current_category = links[current_category_index];
  if (!current_category) return { nextPage: undefined, prevPage: undefined };

  // user's current page.
  const current_page = current_category.list.find((x) => x.href === path);
  if (!current_page) return { nextPage: undefined, prevPage: undefined };

  // the next page in the array.
  const nonGroupItems = current_category.list.filter((x) => !x.group);
  const currentPageIndex = nonGroupItems.findIndex(
    (x) => x.href === current_page.href
  );

  let next_page = nonGroupItems[currentPageIndex + 1];

  //if there isn't a next page, then go to next cat's page.
  if (!next_page) {
    // get next cat
    let next_category_index = current_category_index + 1;
    // if doesn't exist, return to first cat.
    if (next_category_index >= links.length) next_category_index = 0;

    const next_category = links[next_category_index];

    // If next category is a single page
    if (next_category.isSingle) {
      next_page = next_category as any; // Type assertion to bypass type checking
    } else {
      // Find first non-group item in next category
      const firstNonGroupItem = next_category.list.find((item) => !item.group);
      if (firstNonGroupItem) {
        next_page = firstNonGroupItem;
      }
    }
  }

  // the prev page in the array.
  let prev_page = nonGroupItems[currentPageIndex - 1];

  // if there isn't a prev page, then go to prev cat's page.
  if (!prev_page) {
    // get prev cat
    let prev_category_index = current_category_index - 1;
    // if doesn't exist, return to last cat.
    if (prev_category_index < 0) prev_category_index = links.length - 1;

    const prev_category = links[prev_category_index];

    // If prev category is a single page
    if (prev_category.isSingle) {
      prev_page = prev_category as any; // Type assertion to bypass type checking
    } else {
      // Get last non-group item in prev category
      const prevCategoryNonGroupItems = prev_category.list.filter(
        (item) => !item.group
      );
      prev_page =
        prevCategoryNonGroupItems[prevCategoryNonGroupItems.length - 1];
    }
  }

  const pages = source.getPages();
  const next_page2 = next_page
    ? pages.find((x) => x.url === next_page.href)
    : undefined;
  let prev_page2 = prev_page
    ? pages.find((x) => x.url === prev_page.href)
    : undefined;
  if (path === "/docs/introduction") prev_page2 = undefined;
  return { nextPage: next_page2, prevPage: prev_page2 };
}
