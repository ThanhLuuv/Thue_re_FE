import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, TextField, FormHelperText, Button, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, AppBar, Toolbar } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CropIcon from '@mui/icons-material/Crop';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';

// Constants
const MAX_IMAGES = 5;

// Mock data - replace with actual data from your API
const categories = [
  { id: 1, name: 'Category 1' },
  { id: 2, name: 'Category 2' },
];

const provinces = [
  { id: 1, name: 'Province 1' },
  { id: 2, name: 'Province 2' },
];

// Styled Components
const ImagePreview = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '200px',
  border: `2px dashed ${theme.palette.grey[400]}`,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backgroundColor: theme.palette.grey[50],
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.grey[100],
  },
  '& img': {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
}));

const ImageList = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const ImageItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '80px',
  height: '80px',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

const AddressItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
}));

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.paper,
}));

const VisuallyHiddenInput = (props) => (
  <input
    style={{
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      width: 1,
    }}
    {...props}
  />
);

const PostPage = () => {
  const [step, setStep] = useState(1); // Step 1: Basic info & images, Step 2: Availability & locations
  const [formData, setFormData] = useState({
    itemData: {
      category_id: '',
      item_name: '',
      rental_price: '',
      description: '',
    },
    availability: [{ start_date: null, end_date: null }],
    images: [],
    locations: [{ province: '', district: '', location_detail: '' }],
  });

  const [errors, setErrors] = useState({});
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [crop, setCrop] = useState({});

  const handleNextStep = () => {
    // Basic validation for Step 1 before proceeding
    const newErrors = {};
    if (!formData.itemData.category_id) newErrors.category = 'Vui lòng chọn danh mục';
    if (!formData.itemData.item_name) newErrors.title = 'Vui lòng nhập tên sản phẩm';
    if (!formData.itemData.rental_price) newErrors.price = 'Vui lòng nhập giá cho thuê';
    if (!formData.itemData.description) newErrors.description = 'Vui lòng nhập mô tả';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep(2);
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle final form submission
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      itemData: {
        ...prev.itemData,
        [name]: value,
      },
    }));
  };

  const handleAvailabilityChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.map((period, i) =>
        i === index ? { ...period, [field]: value } : period
      ),
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      is_primary: false,
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, MAX_IMAGES),
    }));
  };

  const openCropDialog = (image) => {
    setCurrentImage(image);
    setCrop({
      unit: 'px',
      width: 200,
      height: 200,
      x: 0,
      y: 0,
    });
    setCropDialogOpen(true);
  };

  const handleCropComplete = (croppedImage) => {
    if (currentImage) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img === currentImage ? { ...img, preview: croppedImage } : img
        ),
      }));
    }
    setCropDialogOpen(false);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const setPrimaryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        is_primary: i === index,
      })),
    }));
  };

  const handleLocationChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.map((location, i) =>
        i === index ? { ...location, [field]: value } : location
      ),
    }));
  };

  const addLocation = () => {
    setFormData((prev) => ({
      ...prev,
      locations: [...prev.locations, { province: '', district: '', location_detail: '' }],
    }));
  };

  const addAvailability = () => {
    setFormData((prev) => ({
      ...prev,
      availability: [...prev.availability, { start_date: null, end_date: null }],
    }));
  };

  const removeAvailability = (index) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }));
  };

  const removeLocation = (index) => {
    setFormData((prev) => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index),
    }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formData.images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData((prev) => ({
      ...prev,
      images: items,
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Container maxWidth="lg" sx={{ py: 4, pb: 8 }}>
        {/* Pinned Submit Button */}
        <AppBar position="sticky" color="default" elevation={2} sx={{ top: 0, bgcolor: 'background.paper', py: 1 }}>
          <Toolbar sx={{ justifyContent: 'center' }}>
            {step === 2 ? (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
                sx={{ px: 4, py: 1, fontWeight: 'bold', borderRadius: 2 }}
              >
                Đăng tin
              </Button>
            ) : null}
          </Toolbar>
        </AppBar>

        <SectionPaper sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center', color: 'primary.main', fontWeight: 'bold' }}>
            Đăng tin mới
          </Typography>

          <form>
            {step === 1 ? (
              <Grid container spacing={3}>
                {/* Left Column: Images */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                    Hình ảnh ({formData.images.length}/{MAX_IMAGES})
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 3, width: '100%' }}
                    disabled={formData.images.length >= MAX_IMAGES}
                    size="small"
                  >
                    Tải ảnh lên
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {errors.images && (
                    <FormHelperText error sx={{ mb: 2 }}>
                      {errors.images}
                    </FormHelperText>
                  )}
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="images" direction="horizontal">
                      {(provided) => (
                        <ImageList
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {formData.images.map((image, index) => (
                            <Draggable
                              key={index}
                              draggableId={`image-${index}`}
                              index={index}
                            >
                              {(provided) => (
                                <ImageItem
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <img src={image.preview} alt={`Preview ${index + 1}`} />
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 0.5,
                                      opacity: 0,
                                      transition: 'opacity 0.3s',
                                      '&:hover': {
                                        opacity: 1,
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                      },
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      sx={{ color: 'white' }}
                                      onClick={() => openCropDialog(image)}
                                    >
                                      <CropIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      sx={{ color: 'white' }}
                                      onClick={() => removeImage(index)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                  {image.is_primary && (
                                    <Chip
                                      label="Ảnh chính"
                                      size="small"
                                      color="primary"
                                      sx={{
                                        position: 'absolute',
                                        top: 4,
                                        left: 4,
                                        fontSize: '0.7rem',
                                        height: 20,
                                      }}
                                    />
                                  )}
                                  <IconButton
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      bottom: 4,
                                      right: 4,
                                      bgcolor: 'white',
                                      boxShadow: 1,
                                      '&:hover': { bgcolor: 'grey.100' },
                                    }}
                                    onClick={() => setPrimaryImage(index)}
                                    disabled={image.is_primary}
                                  >
                                    <StarIcon fontSize="small" color={image.is_primary ? 'disabled' : 'warning'} />
                                  </IconButton>
                                </ImageItem>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </ImageList>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Grid>

                {/* Right Column: Basic Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                    Thông tin cơ bản
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth error={!!errors.category} size="small">
                        <InputLabel shrink>Danh mục tin</InputLabel>
                        <Select
                          name="category_id"
                          value={formData.itemData.category_id}
                          onChange={handleInputChange}
                          label="Danh mục tin"
                          notched
                        >
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Tên hiện thị"
                        name="item_name"
                        value={formData.itemData.item_name}
                        onChange={handleInputChange}
                        error={!!errors.title}
                        helperText={errors.title}
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Chi tiết"
                        name="description"
                        value={formData.itemData.description}
                        onChange={handleInputChange}
                        error={!!errors.description}
                        helperText={errors.description}
                        multiline
                        rows={4}
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Giá thuê"
                        name="rental_price"
                        value={formData.itemData.rental_price}
                        onChange={handleInputChange}
                        error={!!errors.price}
                        helperText={errors.price}
                        type="number"
                        size="small"
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₫</Typography>,
                        }}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="warning"
                    size="large"
                    onClick={handleNextStep}
                    sx={{ px: 4, py: 1, fontWeight: 'bold', borderRadius: 2 }}
                  >
                    Tiếp theo
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={3}>
                {/* Step 2: Availability and Locations */}
                <Grid item xs={12}>
                  <SectionPaper sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                      Thời gian cho thuê
                    </Typography>
                    {formData.availability.map((period, index) => (
                      <Box key={index} sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                            Kỳ {index + 1}
                          </Typography>
                          {index > 0 && (
                            <IconButton
                              size="small"
                              onClick={() => removeAvailability(index)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <DatePicker
                              label="Ngày bắt đầu"
                              value={period.start_date}
                              onChange={(date) => handleAvailabilityChange(index, 'start_date', date)}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  error: !!errors[`availability_${index}_start`],
                                  helperText: errors[`availability_${index}_start`],
                                  size: "small",
                                  variant: "outlined",
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <DatePicker
                              label="Ngày kết thúc"
                              value={period.end_date}
                              onChange={(date) => handleAvailabilityChange(index, 'end_date', date)}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  error: !!errors[`availability_${index}_end`],
                                  helperText: errors[`availability_${index}_end`],
                                  size: "small",
                                  variant: "outlined",
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                        {errors[`availability_${index}_date`] && (
                          <FormHelperText error sx={{ mt: 1 }}>
                            {errors[`availability_${index}_date`]}
                          </FormHelperText>
                        )}
                      </Box>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addAvailability}
                      variant="outlined"
                      fullWidth
                      size="small"
                      sx={{ mt: 2 }}
                    >
                      Thêm kỳ cho thuê
                    </Button>
                  </SectionPaper>

                  <SectionPaper>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                      Địa chỉ cho thuê
                    </Typography>
                    {formData.locations.map((location, index) => (
                      <AddressItem key={index} elevation={0}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                            Địa chỉ {index + 1}
                          </Typography>
                          {index > 0 && (
                            <IconButton
                              size="small"
                              onClick={() => removeLocation(index)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={!!errors[`location_${index}_province`]} size="small">
                              <InputLabel shrink>Tỉnh/Thành</InputLabel>
                              <Select
                                value={location.province}
                                onChange={(e) => handleLocationChange(index, 'province', e.target.value)}
                                label="Tỉnh/Thành"
                                notched
                              >
                                {provinces.map((province) => (
                                  <MenuItem key={province.id} value={province.id}>
                                    {province.name}
                                  </MenuItem>
                                ))}
                              </Select>
                              {errors[`location_${index}_province`] && (
                                <FormHelperText>{errors[`location_${index}_province`]}</FormHelperText>
                              )}
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Quận/Huyện"
                              value={location.district}
                              onChange={(e) => handleLocationChange(index, 'district', e.target.value)}
                              error={!!errors[`location_${index}_district`]}
                              helperText={errors[`location_${index}_district`]}
                              size="small"
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Địa chỉ chi tiết"
                              value={location.location_detail}
                              onChange={(e) => handleLocationChange(index, 'location_detail', e.target.value)}
                              error={!!errors[`location_${index}_detail`]}
                              helperText={errors[`location_${index}_detail`]}
                              size="small"
                              variant="outlined"
                            />
                          </Grid>
                        </Grid>
                      </AddressItem>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addLocation}
                      variant="outlined"
                      fullWidth
                      size="small"
                      sx={{ mt: 2 }}
                    >
                      Thêm địa chỉ
                    </Button>
                  </SectionPaper>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={handlePreviousStep}
                    sx={{ px: 4, py: 1, fontWeight: 'bold', borderRadius: 2 }}
                  >
                    Quay lại
                  </Button>
                </Grid>
              </Grid>
            )}
          </form>
        </SectionPaper>

        <Dialog
          open={cropDialogOpen}
          onClose={() => setCropDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
            Cắt ảnh
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {currentImage && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={handleCropComplete}
                aspect={1}
                style={{ maxHeight: '60vh' }}
              >
                <img src={currentImage.preview} alt="Crop" style={{ maxWidth: '100%' }} />
              </ReactCrop>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCropDialogOpen(false)} size="small" variant="outlined">
              Hủy
            </Button>
            <Button
              onClick={() => setCropDialogOpen(false)}
              variant="contained"
              size="small"
              color="primary"
            >
              Xác nhận
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default PostPage;