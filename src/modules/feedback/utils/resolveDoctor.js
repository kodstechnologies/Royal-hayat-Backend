import mongoose from "mongoose";
import Doctor from "../../doctors/models/doctor.model.js";
import ApiError from "../../../utils/ApiError.js";
import httpStatus from "http-status";

const isMongoObjectId = (value) =>
    mongoose.Types.ObjectId.isValid(value) &&
    String(new mongoose.Types.ObjectId(value)) === String(value);

/**
 * Resolves a doctor strictly by MongoDB _id (not provider/doctorId string).
 */
export const resolveDoctorByMongoId = async (mongoId) => {
    if (!mongoId || typeof mongoId !== "string") {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Doctor MongoDB _id is required",
        );
    }

    const trimmed = mongoId.trim();

    if (!isMongoObjectId(trimmed)) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Invalid doctor MongoDB _id",
        );
    }

    const doctor = await Doctor.findById(trimmed).select("_id doctorId");

    if (!doctor) {
        throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");
    }

    return doctor;
};
