// utils/shareViaMail.js

export const medicalRecordRequestEmailTemplate = (
  request,
  passportFileUrl
) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Medical Record Request Details</h2>

      <p>
        <strong>Patient Full Name:</strong>
        ${request.patientFullName}
      </p>

      <p>
        <strong>Civil ID:</strong>
        ${request.civilId}
      </p>

      <p>
        <strong>Passport / Government ID:</strong>
        <a href="${passportFileUrl}" target="_blank">
          View File
        </a>
      </p>

      <p>
        <strong>Patient File No:</strong>
        ${request.patientFileNo}
      </p>

      <p>
        <strong>Date Of Birth:</strong>
        ${request.dateOfBirth}
      </p>

      <p>
        <strong>Specific Authorization:</strong>
        ${request.specificAuthorization}
      </p>

      <p>
        <strong>Specific Date Of Service:</strong>
        ${request.specificDateOfService || "N/A"}
      </p>

      <p>
        <strong>Recipient Name:</strong>
        ${request.recipientName}
      </p>

      <p>
        <strong>Recipient Email Address:</strong>
        ${request.recipientEmailAddress}
      </p>

      <p>
        <strong>Recipient Contact Number:</strong>
        ${request.recipientContactNumber}
      </p>

      <p>
        <strong>Purpose Of Disclosure:</strong>
        ${request.purposeOfDisclosure}
      </p>

      <p>
        <strong>Other Purpose:</strong>
        ${request.otherPurpose || "N/A"}
      </p>

      <p>
        <strong>Requested By:</strong>
        ${request.requestedBy}
      </p>

      <p>
        <strong>Patient Name Confirmation:</strong>
        ${request.patientNameConfirmation || "N/A"}
      </p>
    </div>
  `;
};