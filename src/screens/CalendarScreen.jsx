import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { format, parse, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { useSchedules, useEvents } from '../hooks/useAgenda';
import { Calendar } from 'react-native-calendars';
import { Plus, Clock, MapPin, Calendar as CalendarIcon, CalendarMinus2, ChevronLeft, ChevronRight, Info } from 'lucide-react-native';

import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import CreateEventModal from '../components/organisms/CreateEventModal';
import EditEventModal from '../components/organisms/EditEventModal';
import ViewEventModal from '../components/organisms/ViewEventModal';
import DeleteEventModal from '../components/organisms/DeleteEventModal';

const DAY_MAP = { 0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA' };

const DOT_COLORS = {
  suspension: '#ef4444',
  school:     '#2563eb',
  exam:       '#8b5cf6',
  holiday:    '#f59e0b',
  makeup:     '#10b981',
  default:    '#94a3b8'
};

const ScheduleCard = ({ item }) => {
  const THREE_LETTER_DAY_MAP = { 'SU': 'SUN', 'MO': 'MON', 'TU': 'TUE', 'WE': 'WED', 'TH': 'THU', 'FR': 'FRI', 'SA': 'SAT' };
  
  const currentDayCode = DAY_MAP[parseISO(item.date || new Date().toISOString()).getDay()];
  const dayAbbreviation = THREE_LETTER_DAY_MAP[item.day_of_week || currentDayCode] || 'TUE';

  const isSuspended = item.isSuspended;
  const displayName = item.course || item.subject || item.title;

  return (
    <View className={`flex-row items-center p-5 mb-4 border border-slate-100 rounded-3xl shadow-sm shadow-slate-200/50 ${isSuspended ? 'bg-slate-100' : 'bg-white'}`}>
      <View className={`w-20 h-20 items-center justify-center rounded-2xl mr-5 ${isSuspended ? 'bg-slate-200' : 'bg-indigo-50/50'}`}>
        <Text className={`font-poppins-bold text-xs mb-1 uppercase ${isSuspended ? 'text-slate-300' : 'text-indigo-600'}`}>
          {dayAbbreviation}
        </Text>
        <CalendarIcon size={24} color={isSuspended ? '#cbd5e1' : '#4f46e5'} strokeWidth={2} />
      </View>

      <View className="flex-1 justify-center">
        <Text className={`font-poppins-bold text-lg leading-6 mb-2 ${isSuspended ? 'text-slate-300' : 'text-slate-700'}`} numberOfLines={2}>
          {displayName}
        </Text>
        
        <View className="flex-row items-center mb-1">
          <Clock size={14} color={isSuspended ? '#cbd5e1' : '#94a3b8'} />
          <Text className={`font-poppins-semibold text-xs ml-2 ${isSuspended ? 'text-slate-300' : 'text-slate-400'}`}>
            {format(parse(item.start_time, 'HH:mm:ss', new Date()), 'h:mm a')} - {format(parse(item.end_time, 'HH:mm:ss', new Date()), 'h:mm a')}
          </Text>
        </View>

        <View className="flex-row items-center">
          <MapPin size={14} color={isSuspended ? '#cbd5e1' : '#94a3b8'} />
          <Text className={`font-poppins-semibold text-xs ml-2 ${isSuspended ? 'text-slate-300' : 'text-slate-400'}`}>
            {item.room}
          </Text>
        </View>
      </View>
    </View>
  );
};

const AltScheduleCard = ({ item, index }) => {
  const isPrimary = index === 2; 
  
  return (
    <View className="flex-row mb-6 px-4">
      <View className="w-16 pt-1">
        <Text className="font-poppins-bold text-slate-900 text-sm">{item.start_time}</Text>
        <Text className="font-poppins text-slate-400 text-[10px]">{item.end_time}</Text>
      </View>

      <View className="items-center mx-2">
        <View className={`w-4 h-4 rounded-full border-2 items-center justify-center ${isPrimary ? 'border-indigo-600' : 'border-slate-200'}`}>
          {isPrimary && <View className="w-2 h-2 bg-indigo-600 rounded-full" />}
        </View>
        <View className="w-[1px] flex-1 bg-slate-100 my-1" />
      </View>

      <View className={`flex-1 p-4 rounded-3xl ${isPrimary ? 'bg-indigo-600' : 'bg-white border border-slate-100'}`}>
        <Text className={`font-poppins-bold text-sm mb-1 ${isPrimary ? 'text-white' : 'text-slate-900'}`}>
          {item.subject}
        </Text>
        <Text className={`font-poppins text-[10px] ${isPrimary ? 'text-indigo-100' : 'text-slate-500'}`}>
          {item.instructor} • {item.section} • {item.start_time} - {item.end_time}
        </Text>
      </View>
    </View>
  );
};

const EventCard = ({ item, onPress }) => {
  const isSuspension = item.type?.toLowerCase() === 'suspension' || item.type === 'CLASS SUSPENSION';
  const isWholeDay = item.start_time === '00:00:00' && item.end_time === '23:59:59';
  const cardStyles = {
    suspension: 'bg-rose-50 border-rose-100',
    school: 'bg-blue-50 border-blue-200',
    exam: 'bg-violet-50 border-violet-200',
    holiday: 'bg-emerald-50 border-emerald-200',
    makeup: 'bg-indigo-50 border-indigo-200',
    default: 'bg-mauve-50 border-mauve-200'
  }
  const cardAccent = {
    suspension: 'bg-rose-200/80',
    school: 'bg-blue-200/80',
    exam: 'bg-violet-200/80',
    holiday: 'bg-emerald-200/80',
    makeup: 'bg-indigo-200/80',
    default: 'bg-mauve-200/80'
  }

  const textStyles = {
    suspension: 'text-rose-600',
    school: 'text-blue-600',
    exam: 'text-violet-600',
    holiday: 'text-emerald-600',
    makeup: 'text-indigo-600',
    default: 'text-mauve-600'
  }
  
  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => onPress(item)} // Pass the whole event object
      className={`p-5 mb-4 border rounded-3xl ${cardStyles[item.type?.toLowerCase() || 'default']}`}
    >
      <View className="flex-row justify-between items-center mb-3">
        <View className={`px-2 py-1 rounded-lg ${cardAccent[item.type?.toLowerCase() || 'default']}`}>
          <Text className={`font-poppins-bold text-xs uppercase tracking-widest ${textStyles[item.type?.toLowerCase() || 'default']}`}>
            {item.type || 'Event'}
          </Text>
        </View>
        <Text className={`font-poppins-semibold text-xs ${textStyles[item.type?.toLowerCase() || 'default'] } uppercase tracking-wider`}>
          {isWholeDay ? 'All Day' : `${format(parse(item.start_time, 'HH:mm:ss', new Date()), 'h:mm')} - ${format(parse(item.end_time, 'HH:mm:ss', new Date()), 'h:mm')}`}
        </Text>
      </View>

      <Text className={`font-poppins-bold text-lg mb-2 ${textStyles[item.type?.toLowerCase() || 'default']}`}>
        {item.title}
      </Text>
      
      <Text className={`font-poppins text-sm ${textStyles[item.type?.toLowerCase() || 'default']} leading-5 mb-4`}>
        {item.description}
      </Text>

      {isSuspension && (
        <View className="flex-row items-center pt-3 border-t border-rose-100">
          <Info size={16} color="#ef4444" strokeWidth={2} />
          <Text className="font-poppins-semibold text-xs text-rose-600 uppercase tracking-wider ml-2">
            All Classes Suspended
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const EmptyState = ({ message }) => (
  <View className="items-center justify-center py-10 opacity-50">
    <CalendarMinus2 size={40} color="#94a3b8" />
    <Text className="font-poppins text-slate-400 mt-2 text-center">{message}</Text>
  </View>
);

const AgendaSection = ({selectedDate, events, schedules, onEventPress }) => {
  const [activeTab, setActiveTab] = useState('schedules');

  // Sort events chronologically by start_time
  const dailyEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events
      .filter(e => (e.date || e.start_date) === selectedDate)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)); // Added sorting
  }, [selectedDate, events]);

  // Sort schedules chronologically by start_time
  const dailySchedules = useMemo(() => {
    const dateObj = parseISO(selectedDate);
    const dayCode = DAY_MAP[dateObj.getDay()];
    
    const safeSchedules = Array.isArray(schedules) ? schedules : [];
    const regularClasses = safeSchedules.filter(s => s.day_of_week === dayCode);

    const blockingEvents = dailyEvents.filter(e => 
      ['suspension', 'holiday', 'school'].includes(e.type?.toLowerCase())
    );

    const exams = dailyEvents.filter(e => e.type?.toLowerCase() === 'exam');
    const makeups = dailyEvents.filter(e => e.type?.toLowerCase() === 'makeup');

    let baseList = [];
    if (exams.length > 0) {
      baseList = exams.map(e => ({ ...e, subject: e.title, isExam: true }));
    } else {
      const makeupSchedules = makeups.map(e => ({ ...e, subject: e.title, isMakeup: true }));
      baseList = [...regularClasses, ...makeupSchedules];
    }

    const normalizeTime = (t) => (t && t.length === 5 ? `${t}:00` : t);

    return baseList
      .map(item => {
        const isSuspended = blockingEvents.some(event => {
          const isEventWholeDay = event.isWholeDay || (event.start_time === '00:00:00' && event.end_time === '23:59:59');
          if (isEventWholeDay) return true;

          const classStart = normalizeTime(item.start_time);
          const classEnd = normalizeTime(item.end_time);
          const eventStart = normalizeTime(event.start_time);
          const eventEnd = normalizeTime(event.end_time);

          return classStart < eventEnd && classEnd > eventStart;
        });
        return { ...item, isSuspended, day_of_week: dayCode };
      })
      .sort((a, b) => a.start_time.localeCompare(b.start_time)); // Added sorting
  }, [selectedDate, dailyEvents, schedules]);

  const activeCount = activeTab === 'schedules' ? dailySchedules.length : dailyEvents.length;

  return (
    <View className="mt-6 flex-1">
      <View className="flex-row mb-8 bg-slate-100/50 rounded-2xl border border-slate-200/50">
        {[
          { id: 'schedules', label: 'Schedules', count: dailySchedules.length },
          { id: 'events', label: 'Events', count: dailyEvents.length }
        ].map((tab) => {
          const isFocused = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 rounded-2xl flex-row items-center justify-center ${isFocused ? 'bg-white' : ''}`}
            >
              <Text className={`font-poppins-semibold text-sm mr-2 ${isFocused ? 'text-indigo-600' : 'text-slate-400'}`}>
                {tab.label}
              </Text>
              <View className={`px-2 py-0.5 rounded-lg ${isFocused ? 'bg-indigo-100' : 'bg-slate-200'}`}>
                <Text className={`font-poppins-bold text-[8px] text-center ${isFocused ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView className="flex-1 px-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {activeTab === 'schedules' ? (
          dailySchedules.map((item, index) => (
            <ScheduleCard key={index} item={item} index={index} />
          ))
        ) : (
          dailyEvents.map((item, index) => (
            <EventCard 
              key={item.id || index} 
              item={item} 
              onPress={onEventPress}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const CalendarScreen = () => {
  const { activeRole } = useAuthStore();
  const [selected, setSelected] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isModalVisible, setModalVisible] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: schedules = [] } = useSchedules();
  const { data: events = [], isLoading: eventsLoading } = useEvents(
    format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
    format(endOfMonth(currentMonth), 'yyyy-MM-dd')
  );

  const markedDates = useMemo(() => {
    const marks = {};

    if (Array.isArray(events)) {
      events?.forEach(event => {
        const date = event.date || event.start_date;
        if (!date) return; 

        const type = event.type?.toLowerCase() || 'default';
        const color = DOT_COLORS[type] || DOT_COLORS.default;

        if (!marks[date]) {
          marks[date] = { dots: [] };
        }
        
        marks[date].dots.push({ 
          key: event.id.toString(),
          color: color,
          selectedDotColor: '#ffffff' 
        });
      });
    }

    marks[selected] = { 
      ...marks[selected], 
      selected: true, 
      disableTouchEvent: true 
    };

    return marks;
  }, [selected, events]);

  return (
    <Layout title="Calendar">
      <View className="flex-1">
        <Calendar
          markingType={'multi-dot'}
          onDayPress={day => setSelected(day.dateString)}
          onMonthChange={month => setCurrentMonth(new Date(month.dateString))}
          markedDates={markedDates}
          renderArrow={(direction) => (<>{direction === 'left' ? (<ChevronLeft size={20} color="#1e293b" />) : (<ChevronRight size={20} color="#1e293b" />)}</>)}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: 'transparent',
            textSectionTitleColor: '#94a3b8',
            selectedDayBackgroundColor: '#4f46e5',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#4f46e5',
            dayTextColor: '#1e293b',
            textDisabledColor: '#cbd5e1',
            monthTextColor: '#0f172a',
            textDayFontFamily: 'Poppins_600SemiBold',
            textMonthFontFamily: 'Poppins_700Bold',
            textDayHeaderFontFamily: 'Poppins_600SemiBold',
            textDayFontSize: 14,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 10,
            'stylesheet.calendar.header': {
              header: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingLeft: 10,
                paddingRight: 10,
                marginTop: 6,
                alignItems: 'center',
              },
              week: {
                marginTop: 4,
                paddingTop: 12,
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingVertical: 8,
                paddingHorizontal: 12, 
              },
              dayHeader: {
                textTransform: 'uppercase',
                fontSize: 10,
                fontFamily: 'Poppins_600SemiBold',
                color: '#94a3b8',
                textAlign: 'center',
                width: 44, 
              },
            },
            'stylesheet.calendar.main': {
              container: {
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: '#f8fafc',
                borderRadius: 16,
              },
              monthView: {
                backgroundColor: '#ffffff',
                paddingBottom: 12,
                paddingHorizontal: 12, 
              },
              week: {
                flexDirection: 'row',
                justifyContent: 'space-around',
              }
            },
            'stylesheet.day.basic': {
              base: {
                width: 44,
                height: 44,
                alignItems: 'center',
              },
              text: {
                fontFamily: 'Poppins_500Medium',
                fontSize: 14,
                color: '#1e293b',
                marginTop: 8, 
              },
              dotContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2, 
                width: '100%',
              },
              dot: {
                width: 12,         
                height: 12,        
                borderRadius: 6,
                marginHorizontal: 1,
              },
              visibleDot: {
                opacity: 1,
                width: 12,         
                height: 12,        
                borderRadius: 6,
              },
              selected: {
                backgroundColor: '#4f46e5',
                borderRadius: 12,
              },
              selectedText: {
                fontFamily: 'Poppins_600SemiBold',
                color: '#ffffff',
              },
              today: {
                color: '#4f46e5', 
              }
            }
          }}
        />
        <AgendaSection 
          selectedDate={selected} 
          events={events || []} 
          schedules={schedules || []} 
          onEventPress={(item) => setViewingEvent(item)} // <-- Pass this prop
        />

        {viewingEvent && (
          <Modal visible={!!viewingEvent} transparent animationType="slide">
            <ViewEventModal 
                event={viewingEvent} 
                onClose={() => setViewingEvent(null)}
                onEdit={(event) => {
                  setViewingEvent(null);
                  setEditingEvent(event);
                }}
                onDelete={(event) => {
                  setDeletingEvent(event);
                  setViewingEvent(null);
                }}
            />
          </Modal>
        )}

        {editingEvent && (
          <Modal visible={!!editingEvent} transparent animationType="slide">
            <EditEventModal 
                event={editingEvent} 
                onClose={() => setEditingEvent(null)} 
            />
          </Modal>
        )}

        {deletingEvent && (
          <Modal visible={!!deletingEvent} transparent animationType="slide">
            <DeleteEventModal 
                event={deletingEvent} 
                onClose={() => setDeletingEvent(null)} 
                onDeleted={() => setDeletingEvent(null)} 
            />
          </Modal>
        )}
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <CreateEventModal 
            selectedDate={selected} 
            onClose={() => setModalVisible(false)} 
          />
        </View>
      </Modal>

      {activeRole === 'program_head' && (
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="absolute bottom-6 right-6 size-16 bg-indigo-600 rounded-2xl items-center justify-center"
        >
          <Plus size={28} color="white" />
        </TouchableOpacity>
      )}
    </Layout>
  );
};

export default CalendarScreen;