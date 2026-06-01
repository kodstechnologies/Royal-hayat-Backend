import CSR from "../model/csr.model.js";

class CSRRepository {
  async createCSR(data) {
    return await CSR.create(data);
  }

  async getAllCSR() {
    return await CSR.find().sort({ createdAt: -1 }).lean();
  }

  async getCSRById(id) {
    return await CSR.findById(id);
  }

  async updateCSR(id, data) {
    return await CSR.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteCSR(id) {
    return await CSR.findByIdAndDelete(id);
  }
}

export default new CSRRepository();