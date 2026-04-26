import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Pressable } from 'react-native';
import { X, ChevronRight, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreateAnnouncement, useAnnouncementTargets } from '../../hooks/useAnnouncements';
import Toast from 'react-native-toast-message';

const CreateAnnouncementModal = ({ onClose }) => {
  const { mutate: createAnnouncement, isLoading } = useCreateAnnouncement();
  const { data: targetsData } = useAnnouncementTargets();
  const availablePrograms = targetsData?.programs || [];
  const availableSections = targetsData?.sections || [];
  const availableRoles = targetsData?.roles || [];

  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0); 
  const [isGlobal, setIsGlobal] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [targetGroups, setTargetGroups] = useState({
    role: false,
    program: false,
    section: false
  });
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    require_acknowledgement: false,
    targets: [] 
  });

  const nextStep = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }
    
    setErrors({});
    setStep(1);
  };

  const handleFinalSubmit = () => {
    const payload = { ...form };

    if (isGlobal) {
      payload.targets = null;
    } else if (payload.targets.length === 0) {
      setErrors(prev => ({ ...prev, targets: true }));
      return; 
    }

    createAnnouncement(payload, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Announcement Posted!',
          text2: 'Your message has been distributed.',
          position: 'top',
        });
        onClose();
      },
      onError: (err) => {
        Toast.show({
          type: 'error',
          text1: 'Failed to post',
          text2: err.response?.data?.message || 'Check your network connection.',
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

      <KeyboardAvoidingView behavior="padding" className="bg-white rounded-t-3xl overflow-hidden" style={{ height: '60%' }}>
        <View className="p-6 flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-xl text-slate-900">
                {step === 0 ? "Announcement Info" : "Target Audience"}
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
                  <Text className="text-slate-500 mb-1 ml-1" style={{ fontFamily: 'Poppins_500Medium' }}>Title</Text>
                  <TextInput 
                    className={`bg-slate-50 p-4 rounded-2xl border ${errors.title ? 'border-rose-500 bg-rose-50' : 'border-slate-100'}`}
                    placeholder="e.g., Final Exam Schedule Update"
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
                  <Text className="text-slate-500 mb-1 ml-1" style={{ fontFamily: 'Poppins_500Medium' }}>Message</Text>
                  <TextInput 
                    multiline={true}
                    numberOfLines={6}
                    className={`bg-slate-50 p-4 rounded-2xl border h-40 text-top ${errors.description ? 'border-rose-500 bg-rose-50' : 'border-slate-100'}`}
                    placeholder="Write your announcement here..."
                    style={{ textAlignVertical: 'top' }}
                    value={form.description}
                    onChangeText={(t) => {
                      setForm({...form, description: t});
                      if (errors.description) setErrors({...errors, description: null});
                    }}
                  />
                  {errors.description && <Text className="text-rose-500 text-xs mt-1 ml-2 font-poppins">{errors.description}</Text>}
                </View>

                {/* Require Acknowledgement Toggle */}
                <TouchableOpacity
                  onPress={() => setForm(prev => ({ ...prev, require_acknowledgement: !prev.require_acknowledgement }))}
                  className="p-4 rounded-2xl mt-2 border flex-row justify-between items-center bg-slate-50 border-slate-100"
                >
                  <View>
                    <Text style={{ fontFamily: 'Poppins_500Medium' }} className='text-slate-700'>
                      Require Acknowledgement
                    </Text>
                    <Text style={{ fontFamily: 'Poppins_400Regular' }} className='text-slate-400 text-xs'>
                      Users must confirm they read this.
                    </Text>
                  </View>
                  <View className={`w-10 h-6 rounded-full p-1 ${form.require_acknowledgement ? 'bg-indigo-600 items-end' : 'bg-slate-300 items-start'}`}>
                    <View className="w-4 h-4 bg-white rounded-full" />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="pb-8">
                 {/* Target Audience Logic (Identical to Events but includes Roles) */}
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
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className={isGlobal ? 'text-indigo-700' : 'text-slate-800'}>
                      Global Announcement
                    </Text>
                    <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-slate-500 text-xs">
                      Visible to everyone in the institution.
                    </Text>
                  </View>
                  <View className={`w-12 h-7 rounded-full p-1 ${isGlobal ? 'bg-indigo-600 items-end' : 'bg-slate-300 items-start'}`}>
                    <View className="w-5 h-5 bg-white rounded-full" />
                  </View>
                </TouchableOpacity>

                {!isGlobal && (
                  <View>
                    <Text className="text-slate-500 mb-4 ml-1" style={{ fontFamily: 'Poppins_500Medium' }}>Target Specific Groups</Text>

                    {/* Roles Target (New for Announcements) */}
                    <View className={`mb-4 bg-slate-50 p-4 rounded-3xl border ${errors.targets ? 'border-rose-500' : 'border-slate-100'}`}>
                      <TouchableOpacity 
                        className="flex-row items-center"
                        onPress={() => {toggleTargetGroup('role'); if (errors.targets) setErrors(prev => ({ ...prev, targets: false }));}}
                      >
                        <View className={`size-6 rounded border items-center justify-center mr-3 ${targetGroups.role ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                          {targetGroups.role && <Check size={14} color="white" />}
                        </View>
                        <Text style={{ fontFamily: 'Poppins_500Medium' }} className="text-slate-800 text-base">By Role</Text>
                      </TouchableOpacity>

                      {targetGroups.role && (
                        <View className="flex-row flex-wrap gap-2 mt-4 ml-9">
                          {availableRoles.map(role => (
                            <TouchableOpacity 
                              key={`role-${role.id}`}
                              onPress={() => toggleTarget('role', role.id)}
                              className={`px-4 py-2 rounded-full border ${isTargetSelected('role', role.id) ? 'bg-indigo-100 border-indigo-300' : 'bg-white border-slate-200'}`}
                            >
                              <Text style={{ fontFamily: 'Poppins_500Medium' }} className={isTargetSelected('role', role.id) ? 'text-indigo-700' : 'text-slate-600'}>
                                {role.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                    
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
          <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white text-lg mr-2">{isLoading ? 'Publishing...' : step === 0 ? 'Next' : 'Post Announcement'}</Text>
          {step === 0 && <ChevronRight size={20} color="white" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateAnnouncementModal;