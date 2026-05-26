import DashboardRepository from "../repository/dashboard.repository.js";

const roundRating = (value) => Math.round(value * 10) / 10;

class DashboardService {
  async getDashboardStats() {
    const [
      appointmentRequests,
      medicalRecordRequests,
      doctorFeedbackCount,
      hospitalFeedbackCount,
      doctorAverageRating,
      hospitalAverageRating,
    ] = await Promise.all([
      DashboardRepository.countAppointmentRequests(),
      DashboardRepository.countMedicalRecordRequests(),
      DashboardRepository.countDoctorFeedbacks(),
      DashboardRepository.countHospitalFeedbacks(),
      DashboardRepository.getAverageDoctorFeedbackRating(),
      DashboardRepository.getAverageHospitalFeedbackRating(),
    ]);

    const feedbacksAndReviews = {
      total: doctorFeedbackCount + hospitalFeedbackCount,
      doctorFeedback: doctorFeedbackCount,
      hospitalFeedback: hospitalFeedbackCount,
    };

    const totalReviews = feedbacksAndReviews.total;
    const overallAverage =
      totalReviews > 0
        ? (doctorAverageRating * doctorFeedbackCount +
            hospitalAverageRating * hospitalFeedbackCount) /
          totalReviews
        : 0;

    return {
      appointmentRequests,
      medicalRecordRequests,
      feedbacksAndReviews,
      averageRatings: {
        overall: roundRating(overallAverage),
        doctorFeedback: roundRating(doctorAverageRating),
        hospitalFeedback: roundRating(hospitalAverageRating),
      },
    };
  }

  async getCurrentWeekAppointmentRequests() {
    const weekData =
      await DashboardRepository.getCurrentWeekAppointmentRequests();

    return {
      weekStart: weekData.weekStart.toISOString(),
      weekEnd: weekData.weekEnd.toISOString(),
      total: weekData.total,
      dailyBreakdown: weekData.dailyBreakdown,
    };
  }

  async getMonthlyAppointmentRequests(months = 12) {
    const parsedMonths = Number(months);
    const safeMonths =
      Number.isFinite(parsedMonths) && parsedMonths > 0
        ? Math.min(Math.floor(parsedMonths), 24)
        : 12;

    const monthData =
      await DashboardRepository.getMonthlyAppointmentRequests(safeMonths);

    return {
      rangeStart: monthData.rangeStart.toISOString(),
      rangeEnd: monthData.rangeEnd.toISOString(),
      months: monthData.months,
      total: monthData.total,
      monthlyBreakdown: monthData.monthlyBreakdown,
    };
  }

  async getFeedbackStarStats() {
    return DashboardRepository.getFeedbackStarStats();
  }

  async getDoctorsCountByDepartment() {
    return DashboardRepository.getDoctorsCountByDepartment();
  }
}

export default new DashboardService();
