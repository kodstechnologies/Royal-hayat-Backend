import AppointmentRequest from '../model/appointmentRequest.model.js';

class AppointmentRequestRepository {
  async create(data) {
    return AppointmentRequest.create(data);
  }

  async findPaginated(filter, { skip, limit }) {
    return AppointmentRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countDocuments(filter) {
    return AppointmentRequest.countDocuments(filter);
  }

  async findById(id) {
    return AppointmentRequest.findById(id);
  }

  async findByIdAndMarkViewed(id) {
    return AppointmentRequest.findByIdAndUpdate(
      id,
      { isViewed: true },
      { new: true },
    );
  }

  async updateById(id, payload) {
    return AppointmentRequest.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id) {
    return AppointmentRequest.findByIdAndDelete(id);
  }

  async countUnviewed() {
    return AppointmentRequest.countDocuments({ isViewed: false });
  }

  async countUnviewedByRequestType(requestType) {
    return AppointmentRequest.countDocuments({
      isViewed: false,
      requestType,
    });
  }
}

export default new AppointmentRequestRepository();
