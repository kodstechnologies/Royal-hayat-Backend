
import MedicalRecordRequest from "../model/medicalRecordRequest.model.js";

export const buildMedicalRecordRequestsFilter = ({ search = "", status = "all" } = {}) => {
    const filter = {};

    if (status === "pending") {
        filter.isViewed = false;
    } else if (status === "received") {
        filter.isViewed = true;
    }

    const term = String(search || "").trim();
    if (term) {
        const pattern = new RegExp(
            term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i",
        );

        filter.$or = [
            { mrrId: pattern },
            { patientFullName: pattern },
            { patientFileNo: pattern },
            { recipientName: pattern },
            { recipientEmailAddress: pattern },
            { purposeOfDisclosure: pattern },
            { otherPurpose: pattern },
            { requestedBy: pattern },
            { validIdentification: pattern },
            { specificAuthorization: pattern },
        ];
    }

    return filter;
};

export const createMedicalRecordRequestRepo = async (payload) => {
    return await MedicalRecordRequest.create(payload);
};

export const getMedicalRecordRequestsPaginatedRepo = async ({
    page,
    limit,
    search,
    status,
}) => {
    const filter = buildMedicalRecordRequestsFilter({ search, status });
    const skip = (page - 1) * limit;

    return Promise.all([
        MedicalRecordRequest.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        MedicalRecordRequest.countDocuments(filter),
    ]);
};

export const countMedicalRecordRequestsRepo = async (filter = {}) => {
    return MedicalRecordRequest.countDocuments(filter);
};

export const getAllMedicalRecordRequestsRepo = async () => {
    return await MedicalRecordRequest.find()
        .sort({ createdAt: -1 })
        .lean();
};

export const getMedicalRecordRequestByIdRepo = async (id) => {
    return await MedicalRecordRequest.findByIdAndUpdate(
        id,
        {
            isViewed: true
        },
        {
            new: true
        }
    );
};
export const deleteMedicalRecordRequestRepo = async (id) => {
    return await MedicalRecordRequest.findByIdAndDelete(id);
};