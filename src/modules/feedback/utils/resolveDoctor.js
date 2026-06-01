import mongoose from "mongoose";
import Doctor from "../../doctors/models/doctor.model.js";
import ApiError from "../../../utils/ApiError.js";
import httpStatus from "http-status";

const isMongoObjectId = (value) =>
    mongoose.Types.ObjectId.isValid(value) &&
    String(new mongoose.Types.ObjectId(value)) === String(value);

export const resolveDoctorByDoctorId = async (doctorIdOrMongoId) => {
    if (!doctorIdOrMongoId || typeof doctorIdOrMongoId !== "string") {
        throw new ApiError(httpStatus.BAD_REQUEST, "doctorId is required");
    }

    const trimmed = doctorIdOrMongoId.trim();

    let doctor = await Doctor.findOne({ doctorId: trimmed }).select("_id doctorId");

    if (!doctor && isMongoObjectId(trimmed)) {
        doctor = await Doctor.findById(trimmed).select("_id doctorId");
    }

    if (!doctor) {
        throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");
    }

    return doctor;
};
