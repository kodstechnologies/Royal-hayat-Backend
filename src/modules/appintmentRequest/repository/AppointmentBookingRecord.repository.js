import AppointmentBookingRecord from '../model/appointmentBookingRecord.model.js';

class AppointmentBookingRecordRepository {
  async create(data) {
    return AppointmentBookingRecord.create(data);
  }

  async findPaginated(filter, { skip, limit }) {
    return AppointmentBookingRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countDocuments(filter) {
    return AppointmentBookingRecord.countDocuments(filter);
  }

  async findByIdAndMarkViewed(id) {
    return AppointmentBookingRecord.findByIdAndUpdate(
      id,
      { isViewed: true },
      { new: true },
    );
  }

  async updateById(id, payload) {
    return AppointmentBookingRecord.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id) {
    return AppointmentBookingRecord.findByIdAndDelete(id);
  }

  async countUnviewed() {
    return AppointmentBookingRecord.countDocuments({ isViewed: false });
  }
}

export default new AppointmentBookingRecordRepository();
