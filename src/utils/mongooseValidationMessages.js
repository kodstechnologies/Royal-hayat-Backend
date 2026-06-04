const FIELD_LABELS = {
  departmentId: 'Department ID',
  name: 'Name',
  arabicName: 'Arabic name',
  description: 'Description',
  arabicDescription: 'Arabic description',
  catagory: 'Category',
  image: 'Image',
  isActive: 'Status',
  order: 'Order',
};

const getFieldLabel = (path) => FIELD_LABELS[path] || path;

export const formatMongooseValidationError = (validationError) => {
  if (!validationError?.errors) {
    return validationError?.message || 'Validation failed';
  }

  return Object.values(validationError.errors).map((err) => {
    const label = getFieldLabel(err.path);
    const limit = err.properties?.length ?? err.properties?.maxlength;

    switch (err.kind) {
      case 'minlength':
        return `${label} must be at least ${limit} characters`;
      case 'maxlength':
        return `${label} must not exceed ${limit} characters`;
      case 'required':
        return `${label} is required`;
      default:
        return err.message || `${label} is invalid`;
    }
  });
};
