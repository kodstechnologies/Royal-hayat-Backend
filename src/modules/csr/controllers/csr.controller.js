// controllers/csr.controller.js

import asyncHandler from '../../../utils/asyncHandler.js';
import httpStatus from "http-status";

import CSRService from "../services/csr.service.js";

// Create CSR
export const createCSR = asyncHandler(async (req, res) => {
  const csr = await CSRService.createCSR(
    req.body,
    req.files
  );

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "CSR created successfully",
    data: csr,
  });
});

// Get All CSR
export const getAllCSR = asyncHandler(async (req, res) => {
  const csr = await CSRService.getAllCSR();

  res.status(httpStatus.OK).json({
    success: true,
    count: csr.length,
    data: csr,
  });
});

// Get CSR By ID
export const getCSRById = asyncHandler(async (req, res) => {
  const csr = await CSRService.getCSRById(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    data: csr,
  });
});

// Update CSR
export const updateCSR = asyncHandler(async (req, res) => {
  const updatedCSR = await CSRService.updateCSR(
    req.params.id,
    req.body,
    req.files
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "CSR updated successfully",
    data: updatedCSR,
  });
});

// Delete CSR
export const deleteCSR = asyncHandler(async (req, res) => {
  await CSRService.deleteCSR(req.params.id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "CSR deleted successfully",
  });
});