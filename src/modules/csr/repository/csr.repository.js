import CSR from "../model/csr.model.js";

class CSRRepository {
  // Create
  async createCSR(data) {
    return await CSR.create(data);
  }

  // Get All
  async getAllCSR() {
    return await CSR.find().sort({ createdAt: -1 });
  }

  // Get By ID
  async getCSRById(id) {
    return await CSR.findById(id);
  }

  // Update
  async updateCSR(id, data) {
    return await CSR.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  // Delete
  async deleteCSR(id) {
    return await CSR.findByIdAndDelete(id);
  }
}

export default new CSRRepository();