import { Page } from "../../models/page/page.model.mjs";

class PageService {

  async createPage(payload) {

    // create the page
    const page = new Page(payload);

    await page.save();

    return page;
  }

  async updatePage(id, payload) {
    const page = await Page.findByIdAndUpdate
      (id,
        {
          $set: payload,
        },
        { new: true }
      );
    return page;
  }

  async getPages() {
    const pages = await Page.find();
    return pages;
  }

  async getPage(id) {
    const page = await Page.findById(id);
    return page;
  }

  async deletePage(id) {
    await Page.findByIdAndDelete(id);
  }

}

export default new PageService();