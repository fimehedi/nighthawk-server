import { Asset } from "../../models/asset/asset.model.mjs";

class AssetService {

  async createAsset(payload) {

    // create the asset
    const asset = new Asset(payload);

    await asset.save();

    return asset;
  }

  async updateAsset(id, payload) {
    const asset = await Asset.findByIdAndUpdate
      (id,
        {
          $set: payload,
        },
        { new: true }
      );
    return asset;
  }

  async getAssets() {
    const assets = await Asset.find().populate("category");
    return assets;
  }

  async getAsset(id) {
    const asset = await Asset.findById(id).populate("category");
    return asset;
  }

  async deleteAsset(id) {
    await Asset.findByIdAndDelete(id);
  }

}

export default new AssetService();