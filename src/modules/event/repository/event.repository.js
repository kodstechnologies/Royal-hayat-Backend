import { Event } from "../model/event.model.js";

class EventRepository {
  async create(data) {
    const event = new Event(data);
    return event.save();
  }

  async findById(id) {
    return Event.findById(id);
  }

  async findByIdAndMarkViewed(id) {
    return Event.findByIdAndUpdate(
      id,
      { isViewed: true },
      { new: true, runValidators: true },
    );
  }

  async findMany(query, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    const skip = (page - 1) * limit;

    return Event.find(query).sort(sortOptions).skip(skip).limit(limit).lean();
  }

  async countDocuments(query) {
    return Event.countDocuments(query);
  }

  async countUnviewed(query = {}) {
    return Event.countDocuments({
      ...query,
      isViewed: false,
    });
  }

  async deleteById(id) {
    return Event.findByIdAndDelete(id);
  }
}

export default new EventRepository();
