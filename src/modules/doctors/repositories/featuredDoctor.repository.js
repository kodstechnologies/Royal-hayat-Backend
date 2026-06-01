
import FeaturedDoctor from "../models/featuredDoctors.model.js";

class FeaturedDoctorsRepository {
  async createFeaturedDoctor(data) {
    return await FeaturedDoctor.create(data);
  }

  async getFeaturedDoctors() {
    return await FeaturedDoctor.find()
      .populate("doctor")
      .sort({ createdAt: -1 })
      .lean();
  }

  async getFeaturedDoctorById(id) {
    return await FeaturedDoctor.findById(id).populate(
      "doctor"
    );
  }

  async updateFeaturedDoctor(id, data) {
    return await FeaturedDoctor.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      }
    ).populate("doctor");
  }
}

export default new FeaturedDoctorsRepository();