import AppointmentRequest from "../../appintmentRequest/model/appointmentRequest.model.js";
import AppointmentBookingRecord from "../../appintmentRequest/model/appointmentBookingRecord.model.js";
import MedicalRecordRequest from "../../medicalRecordRequest/model/medicalRecordRequest.model.js";
import DoctorFeedback from "../../feedback/model/DoctorFeedback.model.js";
import HospitalFeedback from "../../feedback/model/HospitalFeedback.model.js";
import Enquiry from "../../enquiry/models/enquiry.model.js";
import JobApplication from "../../jobs/models/jobApplication.model.js";
import AlSafwa from "../../al-safwa/model/alSafwa.model.js";
import InternationalPatientEnquiry from "../../international-patient/model/internationalPatientEnquiry.js";
import { Event } from "../../event/model/event.model.js";
import ChatLog from "../../chat/models/chatLog.model.js";
import Doctor from "../../doctors/models/doctor.model.js";
import Department from "../../departments/models/department.model.js";

const UNVIEWED_FILTER = { isViewed: false };

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getCurrentWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const weekStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOfWeek)
  );
  const weekEnd = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - dayOfWeek + 7
    )
  );

  return { weekStart, weekEnd };
};

const getLastMonthsPeriods = (months) => {
  const now = new Date();
  const periods = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const periodStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1)
    );
    const periodEnd = new Date(
      Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth() + 1, 1)
    );

    periods.push({
      year: periodStart.getUTCFullYear(),
      month: periodStart.getUTCMonth() + 1,
      monthName: MONTH_NAMES[periodStart.getUTCMonth()],
      periodStart,
      periodEnd,
    });
  }

  return {
    rangeStart: periods[0].periodStart,
    rangeEnd: periods[periods.length - 1].periodEnd,
    periods,
  };
};

const STAR_LEVELS = [5, 4, 3, 2, 1];

const formatStarLabel = (stars) => (stars === 1 ? "1 Star" : `${stars} Stars`);

const buildStarBreakdown = (groupedCounts, total) => {
  const countByStar = new Map(
    groupedCounts.map((entry) => [entry._id, entry.count])
  );

  return STAR_LEVELS.map((stars) => {
    const count = countByStar.get(stars) ?? 0;
    const percentage =
      total > 0 ? `${((count / total) * 100).toFixed(1)}%` : "0.0%";

    return {
      stars,
      rating: formatStarLabel(stars),
      count,
      percentage,
    };
  });
};

const mergeStarBreakdowns = (breakdowns, total) => {
  const mergedCounts = new Map(STAR_LEVELS.map((stars) => [stars, 0]));

  breakdowns.forEach((breakdown) => {
    breakdown.forEach((item) => {
      mergedCounts.set(item.stars, (mergedCounts.get(item.stars) ?? 0) + item.count);
    });
  });

  return STAR_LEVELS.map((stars) => {
    const count = mergedCounts.get(stars) ?? 0;
    const percentage =
      total > 0 ? `${((count / total) * 100).toFixed(1)}%` : "0.0%";

    return {
      stars,
      rating: formatStarLabel(stars),
      count,
      percentage,
    };
  });
};

class DashboardRepository {
  async countAppointmentRequests() {
    return AppointmentRequest.countDocuments();
  }

  async countMedicalRecordRequests() {
    return MedicalRecordRequest.countDocuments();
  }

  async countDoctorFeedbacks() {
    return DoctorFeedback.countDocuments();
  }

  async countHospitalFeedbacks() {
    return HospitalFeedback.countDocuments();
  }

  async getAverageDoctorFeedbackRating() {
    const result = await DoctorFeedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$stars" },
        },
      },
    ]);

    return result[0]?.averageRating ?? 0;
  }

  async getAverageHospitalFeedbackRating() {
    const result = await HospitalFeedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$stars" },
        },
      },
    ]);

    return result[0]?.averageRating ?? 0;
  }

  async getCurrentWeekAppointmentRequests() {
    const { weekStart, weekEnd } = getCurrentWeekRange();

    const groupedByDay = await AppointmentRequest.aggregate([
      {
        $match: {
          createdAt: {
            $gte: weekStart,
            $lt: weekEnd,
          },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          requests: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const countByDay = new Map(
      groupedByDay.map((entry) => [entry._id, entry.requests])
    );

    const dailyBreakdown = WEEKDAY_NAMES.map((day, index) => ({
      day,
      requests: countByDay.get(index + 1) ?? 0,
    }));

    const total = dailyBreakdown.reduce((sum, item) => sum + item.requests, 0);

    return {
      weekStart,
      weekEnd,
      total,
      dailyBreakdown,
    };
  }

  async getMonthlyAppointmentRequests(months = 12) {
    const { rangeStart, rangeEnd, periods } = getLastMonthsPeriods(months);

    const groupedByMonth = await AppointmentRequest.aggregate([
      {
        $match: {
          createdAt: {
            $gte: rangeStart,
            $lt: rangeEnd,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          requests: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const countByMonth = new Map(
      groupedByMonth.map((entry) => [
        `${entry._id.year}-${entry._id.month}`,
        entry.requests,
      ])
    );

    const monthlyBreakdown = periods.map((period) => ({
      month: period.monthName,
      year: period.year,
      requests: countByMonth.get(`${period.year}-${period.month}`) ?? 0,
    }));

    const total = monthlyBreakdown.reduce((sum, item) => sum + item.requests, 0);

    return {
      rangeStart,
      rangeEnd,
      months,
      total,
      monthlyBreakdown,
    };
  }

  async getFeedbackStarStats() {
    const [
      doctorGrouped,
      hospitalGrouped,
      doctorTotal,
      hospitalTotal,
    ] = await Promise.all([
      DoctorFeedback.aggregate([
        { $group: { _id: "$stars", count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
      ]),
      HospitalFeedback.aggregate([
        { $group: { _id: "$stars", count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
      ]),
      DoctorFeedback.countDocuments(),
      HospitalFeedback.countDocuments(),
    ]);

    const doctorBreakdown = buildStarBreakdown(doctorGrouped, doctorTotal);
    const hospitalBreakdown = buildStarBreakdown(hospitalGrouped, hospitalTotal);
    const combinedTotal = doctorTotal + hospitalTotal;

    return {
      doctorFeedback: {
        total: doctorTotal,
        breakdown: doctorBreakdown,
      },
      hospitalFeedback: {
        total: hospitalTotal,
        breakdown: hospitalBreakdown,
      },
      combined: {
        total: combinedTotal,
        breakdown: mergeStarBreakdowns(
          [doctorBreakdown, hospitalBreakdown],
          combinedTotal
        ),
      },
    };
  }

  async getUnviewedSidebarCounts() {
    const [
      enquiries,
      doctorFeedbacks,
      hospitalFeedbacks,
      jobApplications,
      medicalRecordRequests,
      appointmentRequests,
      appointmentBookingRecords,
      alSafwaEnrollments,
      internationalPatientEnquiries,
      eventBookings,
      userChats,
    ] = await Promise.all([
      Enquiry.countDocuments(UNVIEWED_FILTER),
      DoctorFeedback.countDocuments({ ...UNVIEWED_FILTER, addedBy: "patient" }),
      HospitalFeedback.countDocuments({ ...UNVIEWED_FILTER, addedBy: "patient" }),
      JobApplication.countDocuments(UNVIEWED_FILTER),
      MedicalRecordRequest.countDocuments(UNVIEWED_FILTER),
      AppointmentRequest.countDocuments(UNVIEWED_FILTER),
      AppointmentBookingRecord.countDocuments(UNVIEWED_FILTER),
      AlSafwa.countDocuments({ ...UNVIEWED_FILTER, isActive: true }),
      InternationalPatientEnquiry.countDocuments({
        ...UNVIEWED_FILTER,
        isActive: true,
      }),
      Event.countDocuments(UNVIEWED_FILTER),
      ChatLog.countDocuments({
        isViewed: { $ne: true },
        source: { $in: ['guided_topic', 'whatsapp'] },
      }),
    ]);

    return {
      enquiries,
      doctorFeedbacks,
      hospitalFeedbacks,
      jobApplications,
      medicalRecordRequests,
      appointmentRequests,
      appointmentBookingRecords,
      alSafwaEnrollments,
      internationalPatientEnquiries,
      eventBookings,
      userChats,
    };
  }

  async getDoctorsCountByDepartment() {
    const [departments, doctorCounts, unassignedDoctors] = await Promise.all([
      Department.find({ isActive: true })
        .select("name arabicName departmentId")
        .sort({ order: 1, name: 1 }),
      Doctor.aggregate([
        { $match: { isActive: true, department: { $ne: null } } },
        {
          $group: {
            _id: "$department",
            doctors: { $sum: 1 },
          },
        },
      ]),
      Doctor.countDocuments({
        isActive: true,
        $or: [{ department: null }, { department: { $exists: false } }],
      }),
    ]);

    const countByDepartment = new Map(
      doctorCounts.map((entry) => [String(entry._id), entry.doctors])
    );

    const assignedTotal = doctorCounts.reduce(
      (sum, entry) => sum + entry.doctors,
      0
    );
    const totalDoctors = assignedTotal + unassignedDoctors;

    const breakdown = departments.map((department) => {
      const doctors = countByDepartment.get(String(department._id)) ?? 0;
      const percent =
        totalDoctors > 0 ? Math.round((doctors / totalDoctors) * 100) : 0;

      return {
        departmentId: department._id,
        departmentCode: department.departmentId,
        dept: department.name,
        arabicName: department.arabicName,
        doctors,
        percent,
      };
    });

    if (unassignedDoctors > 0) {
      breakdown.push({
        departmentId: null,
        departmentCode: null,
        dept: "Unassigned",
        arabicName: null,
        doctors: unassignedDoctors,
        percent:
          totalDoctors > 0
            ? Math.round((unassignedDoctors / totalDoctors) * 100)
            : 0,
      });
    }

    return {
      totalDoctors,
      breakdown,
    };
  }
}

export default new DashboardRepository();
