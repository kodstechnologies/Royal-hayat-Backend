// repositories/leadership.repository.js

import Leadership from "../models/leadership.model.js";

class LeadershipRepository {
  // Create
  async createLeadership(data) {
    return await Leadership.create(data);
  }

  // Get All
  async getAllLeadership() {
    return await Leadership.find().sort({ createdAt: -1 });
  }

  // Get By ID
  async getLeadershipById(id) {
    return await Leadership.findById(id);
  }

  // Update
  async updateLeadership(id, data) {
    return await Leadership.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  // Delete
  async deleteLeadership(id) {
    return await Leadership.findByIdAndDelete(id);
  }
}

export default new LeadershipRepository();