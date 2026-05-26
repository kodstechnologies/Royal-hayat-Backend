import Achievement from "../models/achievemnt.model.js";

class AchievementRepository {
  async create(data) {
    return await Achievement.create(data);
  }

  async findAll(filter = {}) {
    return await Achievement.find(filter).sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Achievement.findById(id);
  }

  async updateById(id, data) {
    return await Achievement.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id) {
    return await Achievement.findByIdAndDelete(id);
  }

  async exists(id) {
    return await Achievement.exists({ _id: id });
  }
}

export default new AchievementRepository();
