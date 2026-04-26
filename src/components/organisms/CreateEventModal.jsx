import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { X, ChevronRight, Check, Clock, Calendar } from 'lucide-react-native';
import { useCreateEvent, useManagedTargets } from '../../hooks/useEvents';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker'
import { useQueryClient } from '@tanstack/react-query';
import { parse, format } from 'date-fns';
import Toast from 'react-native-toast-message';

const EVENT_TYPES = [
  { id: 'school', label: 'School' },
  { id: 'exam', label: 'Exam' },
  { id: 'makeup', label: 'Make-up' },
  { id: 'suspension', label: 'Suspension' },
  { id: 'holiday', label: 'Holiday' }
];

const CreateEventModal = ({ onClose, selectedDate }) => {
  const { mutate: createEvent, isLoading } = useCreateEvent();
  const { data: targetsData } = useManagedTargets();
  const queryClient = useQueryClient();
  const availablePrograms = targetsData?.programs || [];
  const availableSections = targetsData?.sections || [];

  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0); 
  const [isGlobal, setIsGlobal] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const [errors, setErrors] = useState({});
  const [pickerMode, setPickerMode] = useState('date');
  const [activeField, setActiveField] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isMultiDay, setIsMultiDay] = useState(false);

  const openPicker = (mode, field) => {
    setPickerMode(mode);
    setActiveField(field);
    setShowPicker(true);
  };

  const onPickerChange = (event, selectedDate) => {
    setShowPicker(false);
    
    if (event.type === 'set' && selectedDate) {
      const formattedValue = pickerMode === 'date' 
        ? selectedDate.toISOString().split('T')[0] 
        : selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      setForm({ ...form, [activeField]: formattedValue });
      if (errors[activeField]) setErrors({ ...errors, [activeField]: null });
    }
  };

  const [targetGroups, setTargetGroups] = useState({
    program: false,
    section: false
  });
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '',
    start_date: selectedDate,
    end_date: selectedDate,
    start_time: null,
    end_time: null,
    targets: [] 
  });

  useEffect(() => {
    if (form.start_date && form.end_date) {
      if (form.end_date !== form.start_date) {
        setIsAllDay(true);
        setIsMultiDay(true);
      } else {
        setIsAllDay(false);
        setIsMultiDay(false);
      }
    }
  }, [form.start_date, form.end_date]);

  const nextStep = () => {
    const newErrors = {};
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; // YYYY-MM-DD format

    // Basic required fields
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.type) newErrors.type = "Event type is required";
    
    // Date validations
    if (!form.start_date) {
      newErrors.start_date = "Start date required";
    } else if (form.start_date < today) {
      newErrors.start_date = "Cannot be in the past";
    }

    if (!form.end_date) {
      newErrors.end_date = "End date required";
    } else if (form.end_date < form.start_date) {
      newErrors.end_date = "Cannot be before start date";
    }

    // Time validations (only if not all day)
    if (!isAllDay) {
      if (!form.start_time) {newErrors.start_time = "Required";}
      if (!form.end_time) {
        newErrors.end_time = "Required";
      } else if (form.end_time < form.start_time) {
        newErrors.end_time = "Cannot end before starting";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }
    
    setErrors({});
    setStep(1);
  };

  const handleFinalSubmit = () => {
    const payload = { ...form };
    
    // Ensure time format matches Laravel's H:i:s validation
    const formatTime = (timeStr) => {
      if (!timeStr) return "00:00:00";
      return timeStr.split(':').length === 2 ? `${timeStr}:00` : timeStr;
    };

    if (isGlobal) {
      payload.targets = null;
    } else if (payload.targets.length === 0) {
      setErrors(prev => ({ ...prev, targets: true }));
      return; 
    }

    if (isAllDay) {
      payload.start_time = "00:00:00";
      payload.end_time = "23:59:59";
    } else {
      payload.start_time = formatTime(form.start_time);
      payload.end_time = formatTime(form.end_time);
    }

    createEvent(payload, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Event Created!',
          text2: 'Event published successfully!',
          position: 'top',
        });
        // Invalidate the 'events' query so the calendar refreshes immediately
        queryClient.invalidateQueries({ queryKey: ['events'] });
        onClose();
      },
      onError: (err) => {
        const serverMsg = err.response?.data?.message;
        const validationErrors = err.response?.data?.errors;
        
        // If there are specific validation errors, you could map them back to the UI here
        Toast.show({
          type: 'error',
          text1: 'Failed to create event',
          text2: validationErrors || serverMsg || 'Check your network connection.',
          position: 'top',
        });
      }
    });
  };

  const toggleTarget = (type, id) => {
    setForm(prev => {
      const exists = prev.targets.some(t => t.type === type && t.id === id);
      if (exists) {
        return { ...prev, targets: prev.targets.filter(t => !(t.type === type && t.id === id)) };
      }
      return { ...prev, targets: [...prev.targets, { type, id }] };
    });
  };

  const isTargetSelected = (type, id) => form.targets.some(t => t.type === type && t.id === id);

  const toggleTargetGroup = (groupType) => {
    setTargetGroups(prev => {
      const isEnabled = !prev[groupType];
      if (!isEnabled) {
        setForm(formPrev => ({
          ...formPrev,
          targets: formPrev.targets.filter(t => t.type !== groupType)
        }));
      }
      return { ...prev, [groupType]: isEnabled };
    });
  };

  return (
    <View className="flex-1 justify-end" style={{ paddingBottom: insets.bottom }}>
      <Pressable className="absolute inset-0" onPress={onClose} />

      <KeyboardAvoidingView behavior="padding" className="bg-white rounded-t-3xl overflow-hidden" style={{ height: '80%' }}>
        <View className="p-6 flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-xl text-slate-900">
                {step === 0 ? "Event Details" : "Target Audience"}
              </Text>
              <View className="flex-row gap-1 mt-2">
                <View className={`h-1 w-8 rounded-full ${step >= 0 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                <View className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {step === 0 ? (
              <View className="gap-y-4 pb-8">

                {/* Title */}
                <View>
                  <Text className="text-slate-500 mb-1 ml-1 font-poppins-medium">Event Title</Text>
                  <TextInput 
                    className={`bg-slate-50 p-4 rounded-2xl border ${errors.title ? 'border-rose-500 bg-rose-50' : 'border-slate-100'}`}
                    placeholder="e.g., General Assembly"
                    value={form.title}
                    onChangeText={(t) => {
                      setForm({...form, title: t});
                      if (errors.title) setErrors({...errors, title: null});
                    }}
                  />
                  {errors.title && <Text className="text-rose-500 text-xs mt-1 ml-2 font-poppins">{errors.title}</Text>}
                </View>

                {/* Description */}
                <View>
                  <Text className="text-slate-500 mb-1 ml-1 font-poppins-medium">Description</Text>
                  <TextInput 
                    multiline={true}
                    numberOfLines={4}
                    className={`bg-slate-50 p-4 rounded-2xl border h-32 text-top ${errors.description ? 'border-rose-500 bg-rose-50' : 'border-slate-100'}`}
                    placeholder="Add more details..."
                    style={{ textAlignVertical: 'top' }}
                    value={form.description}
                    onChangeText={(t) => {
                      setForm({...form, description: t});
                      if (errors.description) setErrors({...errors, description: null});
                    }}
                  />
                  {errors.description && <Text className="text-rose-500 text-xs mt-1 ml-2 font-poppins">{errors.description}</Text>}
                </View>

                {/* Event Type Dropdown */}
                <View>
                  <Text className="text-slate-500 mb-2 ml-1 font-poppins-medium">
                    Event Type
                  </Text>
                  
                  <Dropdown
                    style={[
                      {
                        height: 50,
                        backgroundColor: 'white',
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderColor: errors.type ? '#f43f5e' : '#f1f5f9',
                      },
                      {backgroundColor: '#f8fafc'}
                    ]}
                    placeholderStyle={{ color: '#475569', fontSize: 14, fontFamily: 'Poppins_400Regular' }}
                    selectedTextStyle={{ color: '#1e293b', fontSize: 14, fontFamily: 'Poppins_400Regular' }}
                    data={EVENT_TYPES}
                    labelField="label"
                    valueField="id"
                    placeholder="Select event type"
                    value={form.type}
                    onChange={item => { setForm({ ...form, type: item.id }); if (errors.type) setErrors({ ...errors, type: null }); }}
                    dropdownPosition="bottom"
                    statusBarIsTranslucent={true}
                    containerStyle={{
                      marginTop: -32,
                      borderRadius: 12,
                    }}
                    itemTextStyle={{ fontFamily: 'Poppins_400Regular', fontSize: 14 }}
                    activeColor="#f1f5f9"
                  />

                  {errors.type && (
                    <Text className="text-rose-500 text-xs mt-1 ml-2 font-poppins">
                      {errors.type}
                    </Text>
                  )}
                </View>

                {/* Dates Row */}
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-slate-500 mb-1 ml-1 font-poppins-medium">Start Date</Text>
                    <Pressable className={`flex-row items-center justify-between bg-slate-50 px-4 py-1 rounded-2xl border ${errors.start_date ? 'border-rose-500' : 'border-slate-100'}`} onPress={() => {openPicker('date', 'start_date'); setActiveField('start_date')}}>
                        <TextInput 
                          value={form.start_date} 
                          placeholder="YYYY-MM-DD"
                          editable={false}
                        />
                        <Calendar size={20} color="#64748b" />
                    </Pressable>
                    {errors.start_date && <Text className="text-rose-500 text-[10px] mt-1 ml-1 font-poppins">{errors.start_date}</Text>}
                  </View>

                  <View className="flex-1">
                    <Text className="text-slate-500 mb-1 ml-1" style={{ fontFamily: 'Poppins_500Medium' }}>End Date</Text>
                    <Pressable className={`flex-row items-center justify-between bg-slate-50 px-4 py-1 rounded-2xl border ${errors.end_date ? 'border-rose-500' : 'border-slate-100'}`} onPress={() => {openPicker('date', 'end_date'); setActiveField('end_date')}}>
                        <TextInput 
                          value={form.end_date} 
                          placeholder="YYYY-MM-DD"
                          editable={false}
                        />
                        <Calendar size={20} color="#64748b" />
                    </Pressable>
                    {errors.end_date && <Text className="text-rose-500 text-[10px] mt-1 ml-1 font-poppins">{errors.end_date}</Text>}
                  </View>
                </View>

                {/* All Day Toggle */}
                <TouchableOpacity
                  disabled={isMultiDay}
                  onPress={() => {setIsAllDay(!isAllDay); setForm({...form, start_time: null, end_time: null})}}
                  className={`p-4 rounded-2xl mt-2 border flex-row justify-between items-center ${isMultiDay ? 'bg-slate-100 opacity-60' : 'bg-slate-50'} border-slate-100`}
                >
                  <Text className='font-poppins-medium text-slate-700'>
                    All-Day Event
                  </Text>
                  <View className={`w-10 h-6 rounded-full p-1 ${isAllDay ? 'bg-indigo-600 items-end' : 'bg-slate-300 items-start'}`}>
                    <View className="w-4 h-4 bg-white rounded-full" />
                  </View>
                </TouchableOpacity>

                {/* Times Row (Hidden if All Day) */}
                {!isAllDay && (
                  <View className="flex-row gap-4 mt-2">
                    <View className="flex-1">
                      <Text className="text-slate-500 mb-1 ml-1 font-poppins-medium">Start Time</Text>
                      <Pressable className={`justify-between flex-row items-center bg-slate-50 pl-4 pr-4 py-1 rounded-2xl border ${errors.start_time ? 'border-rose-500' : 'border-slate-100'}`} onPress={() => {openPicker('time', 'start_time'); setActiveField('start_time')}}>
                        <TextInput 
                          value={form.start_time ? format(parse(form.start_time, 'HH:mm', new Date()), 'h:mm a') : '00:00:00'} 
                          placeholder="00:00:00"
                          editable={false}
                        />
                        <Clock size={20} color="#64748b" />
                      </Pressable>
                      {errors.start_time && <Text className="text-rose-500 text-[10px] mt-1 ml-1 font-poppins">{errors.start_time}</Text>}
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-500 mb-1 ml-1 font-poppins-medium">End Time</Text>
                      <Pressable className={`justify-between flex-row items-center bg-slate-50 pl-4 pr-4 py-1 rounded-2xl border ${errors.end_time ? 'border-rose-500' : 'border-slate-100'}`} onPress={() => {openPicker('time', 'end_time'); setActiveField('end_time')}}>
                        <TextInput 
                          value={form.end_time ? format(parse(form.end_time, 'HH:mm', new Date()), 'h:mm a') : '00:00:00'} 
                          placeholder="00:00:00"
                          editable={false}
                        />
                        <Clock size={20} color="#64748b" />
                      </Pressable>
                      {errors.end_time && <Text className="text-rose-500 text-[10px] mt-1 ml-1 font-poppins">{errors.end_time}</Text>}
                    </View>
                  </View>
                )}

              </View>
            ) : (
              <View className="pb-8">
                {/* Global Toggle */}
                {errors.targets && (
                  <Text className="text-rose-500 text-xs mb-2 font-poppins">
                    Target audience required
                  </Text>
                )}
                <TouchableOpacity 
                  onPress={() => {setIsGlobal(!isGlobal); if (errors.targets) setErrors(prev => ({ ...prev, targets: false }));}}
                  className={`p-5 rounded-3xl mb-6 border-2 flex-row justify-between items-center ${isGlobal ? 'bg-indigo-50 border-indigo-200' : errors.targets ? 'bg-slate-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}
                >
                  <View className="flex-1 pr-4">
                    <Text className={`font-poppins-semibold ${isGlobal ? 'text-indigo-700' : 'text-slate-800'}`}>
                      Global Announcement
                    </Text>
                    <Text className="font-poppins text-slate-500 text-xs">
                      Visible to everyone in the institution.
                    </Text>
                  </View>
                  <View className={`w-12 h-7 rounded-full p-1 ${isGlobal ? 'bg-indigo-600 items-end' : 'bg-slate-300 items-start'}`}>
                    <View className="w-5 h-5 bg-white rounded-full" />
                  </View>
                </TouchableOpacity>

                {!isGlobal && (
                  <View>
                    <Text className="font-poppins-medium text-slate-500 mb-4 ml-1">Target Specific Groups</Text>
                    
                    {/* Entire Program Checkbox & Chips */}
                    <View className={`mb-4 bg-slate-50 p-4 rounded-3xl border ${errors.targets ? 'border-rose-500' : 'border-slate-100'}`}>
                      <TouchableOpacity 
                        className="flex-row items-center"
                        onPress={() => {toggleTargetGroup('program'); if (errors.targets) setErrors(prev => ({ ...prev, targets: false }));}}
                      >
                        <View className={`size-6 rounded border items-center justify-center mr-3 ${targetGroups.program ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                          {targetGroups.program && <Check size={14} color="white" />}
                        </View>
                        <Text className="font-poppins-medium text-slate-800 text-base">Entire Program</Text>
                      </TouchableOpacity>

                      {targetGroups.program && (
                        <View className="flex-row flex-wrap gap-2 mt-4 ml-9">
                          {availablePrograms.map(prog => (
                            <TouchableOpacity 
                              key={`prog-${prog.id}`}
                              onPress={() => toggleTarget('program', prog.id)}
                              className={`px-4 py-2 rounded-full border ${isTargetSelected('program', prog.id) ? 'bg-indigo-100 border-indigo-300' : 'bg-white border-slate-200'}`}
                            >
                              <Text className={`font-poppins-medium ${isTargetSelected('program', prog.id) ? 'text-indigo-700' : 'text-slate-600'}`}>
                                {prog.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Specific Section Checkbox & Chips */}
                    <View className={`bg-slate-50 p-4 rounded-3xl border ${errors.targets ? 'border-rose-500' : 'border-slate-100'}`}>
                      <TouchableOpacity 
                        className="flex-row items-center"
                        onPress={() => {toggleTargetGroup('section'); if (errors.targets) setErrors(prev => ({ ...prev, targets: false }));}}
                      >
                        <View className={`size-6 rounded border items-center justify-center mr-3 ${targetGroups.section ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                          {targetGroups.section && <Check size={14} color="white" />}
                        </View>
                        <Text style={{ fontFamily: 'Poppins_500Medium' }} className="text-slate-800 text-base">Specific Section</Text>
                      </TouchableOpacity>

                      {targetGroups.section && (
                        <View className="flex-row flex-wrap gap-2 mt-4 ml-9">
                          {availableSections.map(sec => (
                            <TouchableOpacity 
                              key={`sec-${sec.id}`}
                              onPress={() => toggleTarget('section', sec.id)}
                              className={`px-4 py-2 rounded-full border ${isTargetSelected('section', sec.id) ? 'bg-indigo-100 border-indigo-300' : 'bg-white border-slate-200'}`}
                            >
                              <Text style={{ fontFamily: 'Poppins_500Medium' }} className={isTargetSelected('section', sec.id) ? 'text-indigo-700' : 'text-slate-600'}>
                                {sec.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <View className="flex-row gap-3 p-6 bg-white">
        {step === 1 && (
          <TouchableOpacity onPress={() => setStep(0)} className="flex-1 bg-slate-100 p-4 rounded-2xl items-center justify-center">
            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-slate-600">Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={step === 0 ? nextStep : handleFinalSubmit} disabled={isLoading} className={`flex-[2] p-4 rounded-2xl flex-row items-center justify-center ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600'}`}>
          <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white text-lg mr-2">{isLoading ? 'Publishing...' : step === 0 ? 'Next' : 'Post Event'}</Text>
          {step === 0 && <ChevronRight size={20} color="white" />}
        </TouchableOpacity>
      </View>
      {showPicker && (
        <DateTimePicker
          value={form[activeField] ? new Date(form[activeField]) : new Date()}
          mode={pickerMode}
          is24Hour={false}
          display="default"
          onChange={onPickerChange}
        />
      )}
    </View>
  );
};

export default CreateEventModal;