
import Leadership from "../models/leadership.model.js";

class LeadershipRepository {
  async createLeadership(data) {
    return await Leadership.create(data);
  }

  async getAllLeadership() {
    return await Leadership.find().sort({ createdAt: -1 }).lean();
  }

  async getLeadershipById(id) {
    return await Leadership.findById(id);
  }

  async updateLeadership(id, data) {
    return await Leadership.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteLeadership(id) {
    return await Leadership.findByIdAndDelete(id);
  }
}

export default new LeadershipRepository();