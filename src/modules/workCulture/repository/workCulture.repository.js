// repositories/workCulture.repository.js

import WorkCulture from "../models/workCulture.model.js";

class WorkCultureRepository {
  // Create
  async createWorkCulture(data) {
    return await WorkCulture.create(data);
  }

  // Get All
  async getAllWorkCultures() {
    return await WorkCulture.find().sort({ createdAt: -1 });
  }

  // Get By ID
  async getWorkCultureById(id) {
    return await WorkCulture.findById(id);
  }

  // Update
  async updateWorkCulture(id, data) {
    return await WorkCulture.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  // Delete
  async deleteWorkCulture(id) {
    return await WorkCulture.findByIdAndDelete(id);
  }
}

export default new WorkCultureRepository();