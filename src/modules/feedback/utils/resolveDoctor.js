import mongoose from "mongoose";
import Doctor from "../../doctors/models/doctor.model.js";
import ApiError from "../../../utils/ApiError.js";
import httpStatus from "http-status";

const isMongoObjectId = (value) =>
    mongoose.Types.ObjectId.isValid(value) &&
    String(new mongoose.Types.ObjectId(value)) === String(value);

const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Resolves a doctor strictly by MongoDB _id (optional backward compatibility).
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

    const doctor = await Doctor.findById(trimmed).select("_id doctorId name nameAr");

    if (!doctor) {
        throw new ApiError(httpStatus.NOT_FOUND, "Doctor not found");
    }

    return doctor;
};

/**
 * Resolves a doctor by hospital/provider doctorId string (not MongoDB _id).
 */
export const resolveDoctorByProviderId = async (providerId) => {
    if (!providerId || typeof providerId !== "string") {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "doctorId is required",
        );
    }

    const trimmed = providerId.trim();

    if (!trimmed) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "doctorId is required",
        );
    }

    const doctor = await Doctor.findOne({ doctorId: trimmed }).select(
        "_id doctorId name nameAr",
    );

    if (!doctor) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            `Doctor not found with doctorId: ${trimmed}`,
        );
    }

    return doctor;
};

/**
 * Resolves a doctor by English or Arabic display name (case-insensitive exact match).
 */
export const resolveDoctorByName = async (doctorName) => {
    if (!doctorName || typeof doctorName !== "string") {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Doctor name is required",
        );
    }

    const trimmed = doctorName.trim();

    if (!trimmed) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Doctor name is required",
        );
    }

    const namePattern = new RegExp(`^${escapeRegex(trimmed)}$`, "i");

    const doctors = await Doctor.find({
        $or: [{ name: namePattern }, { nameAr: namePattern }],
    })
        .select("_id doctorId name nameAr")
        .limit(2);
console.log(doctors);
    if (!doctors.length) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            `Doctor not found with name: ${trimmed}`,
        );
    }

    if (doctors.length > 1) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Multiple doctors match this name. Please use doctorId instead.",
        );
    }

    return doctors[0];
};

/**
 * Resolves a doctor from a route/body identifier:
 * doctorName/name, provider doctorId, or MongoDB _id (legacy).
 */
export const resolveDoctorReference = async ({
    doctorName,
    name,
    doctorId,
    doctor,
} = {}) => {
    const nameValue = doctorName ?? name;
    if (nameValue) {
        return resolveDoctorByName(nameValue);
    }

    const idValue = doctorId ?? doctor;
    if (!idValue || typeof idValue !== "string") {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "doctorName or doctorId is required",
        );
    }

    return resolveDoctorIdentifier(idValue);
};

/**
 * Resolves a single string identifier from URL params:
 * tries provider doctorId, then name, then MongoDB _id.
 */
export const resolveDoctorIdentifier = async (identifier) => {
    if (!identifier || typeof identifier !== "string") {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Doctor identifier is required",
        );
    }

    const trimmed = identifier.trim();

    if (!trimmed) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Doctor identifier is required",
        );
    }

    try {
        return await resolveDoctorByProviderId(trimmed);
    } catch (error) {
        if (!(error instanceof ApiError) || error.statusCode !== httpStatus.NOT_FOUND) {
            throw error;
        }
    }

    try {
        return await resolveDoctorByName(trimmed);
    } catch (error) {
        if (!(error instanceof ApiError) || error.statusCode !== httpStatus.NOT_FOUND) {
            throw error;
        }
    }

    if (isMongoObjectId(trimmed)) {
        return resolveDoctorByMongoId(trimmed);
    }

    throw new ApiError(httpStatus.NOT_FOUND, `Doctor not found: ${trimmed}`);
};
