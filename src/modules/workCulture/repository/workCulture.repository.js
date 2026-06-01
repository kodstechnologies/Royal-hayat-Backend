
import WorkCulture from "../models/workCulture.model.js";

class WorkCultureRepository {
  async createWorkCulture(data) {
    return await WorkCulture.create(data);
  }

  async getAllWorkCultures() {
    return await WorkCulture.find().sort({ createdAt: -1 }).lean();
  }

  async getWorkCultureById(id) {
    return await WorkCulture.findById(id);
  }

  async updateWorkCulture(id, data) {
    return await WorkCulture.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteWorkCulture(id) {
    return await WorkCulture.findByIdAndDelete(id);
  }
}

export default new WorkCultureRepository();