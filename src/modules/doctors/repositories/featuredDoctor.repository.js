// repositories/featuredDoctors.repository.js

import FeaturedDoctor from "../models/featuredDoctors.model.js";

class FeaturedDoctorsRepository {
  // Create
  async createFeaturedDoctor(data) {
    return await FeaturedDoctor.create(data);
  }

  // Get All
  async getFeaturedDoctors() {
    return await FeaturedDoctor.find()
      .populate("doctor")
      .sort({ createdAt: -1 })
      .lean();
  }

  // Get By ID
  async getFeaturedDoctorById(id) {
    return await FeaturedDoctor.findById(id).populate(
      "doctor"
    );
  }

  // Update
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