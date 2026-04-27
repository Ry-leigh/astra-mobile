import React from 'react';
import { View, Text, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { AlertTriangle, Users, CheckCircle2, Megaphone, ChartSpline, Clock, MapPin, PlayCircle, AlertCircle } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAbsenceTrends,useSectionRankings, useAnnouncementCompliance, useInstructorSessions, useInstructorAbsenceTrends } from '../hooks/useDashboard'
import { useAnnouncements } from '../hooks/useAnnouncements';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';

const AbsenceTrendChart = ({ data, isLoading }) => {
  const screenWidth = Dimensions.get("window").width;

  if (isLoading) return (
    <View className="bg-white p-5 rounded-3xl h-64 justify-center items-center mb-4">
      <ActivityIndicator color="#4f46e5" />
    </View>
  );
  
  // Handle empty state
  if (!data || data.length === 0) return null;

  // Map backend data to ChartKit format
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // Indigo-600
        strokeWidth: 3
      }
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0, // No decimals for absence counts
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`, // Slate-500
    style: { borderRadius: 16 },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#4f46e5"
    },
    // Adding Poppins via props
    propsForLabels: {
      fontFamily: 'Poppins_400Regular',
      fontSize: 10
    }
  };

  return (
    <View className="bg-white p-5 rounded-3xl mb-4 border border-slate-100">
      <View className="flex-row items-center mb-4">
        <View className="bg-violet-100 p-2 rounded-xl">
          <ChartSpline size={20} color="#6d28d9" className="mr-2" />
        </View>
        <View className="ml-2">
          <Text className="font-poppins-semibold text-lg text-slate-800">
            Absence Trends
          </Text>
          <Text className="font-poppins text-slate-500 text-xs">
            Total absences per month
          </Text>
        </View>
      </View>
      
      <LineChart
        data={chartData}
        width={screenWidth - 80} // Accounting for padding
        height={220}
        chartConfig={chartConfig}
        bezier // Makes the line curved and smooth
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
        fromZero={true}
      />
    </View>
  );
};

const SectionRiskRanking = () => {
  const { data: rankings, isLoading } = useSectionRankings();

  if (isLoading) {
    return <Text className="text-slate-500 p-4">Loading rankings...</Text>;
  }

  if (!rankings || rankings.length === 0) {
    return <Text className="text-slate-500 p-4">No enrollment data available.</Text>;
  }

  return (
    <View className="bg-white p-5 rounded-3xl border border-slate-100 mb-4">
      <View className="flex-row items-center mb-4">
        <View className="bg-violet-100 p-2 rounded-xl">
          <AlertTriangle size={20} color="#6d28d9" className="mr-2" />
        </View>
        <View className="ml-2">
          <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-lg text-slate-800">
            Section Absenteeism
          </Text>
          <Text className="font-poppins text-slate-500 text-xs">
            Ranked by average absences per student.
          </Text>
        </View>
      </View>

      {rankings.map((section, index) => {
        const isHighestRisk = index === 0 && section.absence_ratio > 0;

        return (
          <View 
            key={section.id} 
            className={`flex-row items-center justify-between p-3 mb-2 rounded-2xl border ${
              isHighestRisk ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-transparent'
            }`}
          >
            {/* Left side: Rank & Name */}
            <View className="flex-row items-center">
              <Text className={`font-poppins-semibold px-2 ${isHighestRisk ? 'text-red-500' : 'text-slate-400'}`}>
                {index + 1}
              </Text>
              <View className="ml-2">
                <Text className={`font-poppins-semibold ${isHighestRisk ? 'text-red-500' : 'text-slate-700'}`}>
                  {section.name}
                </Text>
                <View className="flex-row items-center">
                  <Users size={12} color={isHighestRisk ? "#ef4444" : "#94a3b8"} />
                  <Text className={`text-xs ml-1 ${isHighestRisk ? 'text-red-500' : 'text-slate-400'}`}>
                    {section.total_enrollments} students
                  </Text>
                </View>
              </View>
            </View>

            {/* Right side: The Ratio */}
            <View className="items-end">
              <Text 
                style={{ fontFamily: 'Poppins_600SemiBold' }} 
                className={`text-base ${isHighestRisk ? 'text-red-600' : 'text-slate-800'}`}
              >
                {section.absence_ratio}
              </Text>
              <Text className={`text-xs ${isHighestRisk ? 'text-red-400' : 'text-slate-400'}`}>
                avg absences
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const AnnouncementComplianceTracker = () => {
  const { data: compliance, isLoading } = useAnnouncementCompliance();

  if (isLoading) {
    return <Text className="text-slate-500 p-4">Loading compliance data...</Text>;
  }

  if (!compliance || compliance.length === 0) {
    return null; // Don't show the card if they haven't posted anything requiring auth
  }

  return (
    <View className="bg-white p-5 rounded-3xl mb-4 border border-slate-100">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="bg-violet-100 p-2 rounded-xl">
            <Megaphone size={20} color="#6d28d9" className="mr-2" />
          </View>
          <View className="ml-2">
            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-lg text-slate-800">
              Read Receipts
            </Text>
            <Text className="font-poppins text-slate-500 text-xs">
              Announcement read receipts
            </Text>
          </View>
        </View>
        <Text className="text-xs text-slate-400 font-poppins-medium">Recent</Text>
      </View>

      {compliance.map((item) => {
        // Determine color based on completion
        const isComplete = item.percentage === 100;
        const barColor = isComplete ? 'bg-emerald-500' : 'bg-violet-700';
        const textColor = isComplete ? 'text-emerald-600' : 'text-violet-700';

        return (
          <View key={item.id} className={`bg-slate-50 p-3 rounded-2xl ${item.id === compliance.length ? 'mb-0' : 'mb-2'}`}>
            <View className="flex-row justify-between items-start mb-1">
              <Text 
                style={{ fontFamily: 'Poppins_500Medium' }} 
                className="text-slate-700 flex-1 mr-2" 
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className={textColor}>
                {item.percentage}%
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs text-slate-400 font-poppins-regular">
                {item.time_ago}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-xs text-slate-500 font-poppins-medium">
                  {item.acknowledged} / {item.expected} read
                </Text>
                {isComplete && <CheckCircle2 size={12} color="#10b981" className="ml-1" />}
              </View>
            </View>

            {/* The Progress Bar */}
            <View className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <View 
                className={`h-full rounded-full ${barColor}`} 
                style={{ width: `${item.percentage}%` }} 
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const ActiveSessionsWidget = () => {
  const { data: sessions, isLoading } = useInstructorSessions();

  if (isLoading) return <Text className="p-4 text-slate-500">Loading schedule...</Text>;
  if (!sessions || sessions.length === 0) return <Text className="p-4 text-slate-500">No upcoming classes.</Text>;

  return (
    <View className="mb-6">
      <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-lg text-slate-800 mb-3 ml-1">
        Upcoming & Active Sessions
      </Text>
      {sessions.map(session => (
        <View key={session.id} className={`p-4 rounded-3xl mb-3 border ${session.status === 'open' ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className="text-sm font-poppins-medium text-slate-500">
                {session.section}
              </Text>
              <Text className="font-poppins-semibold text-base/6 text-slate-800 mb-4">
                {session.course}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center">
              <Clock size={16} color="#64748b" />
              <Text style={{ fontFamily: 'Poppins_500Medium' }} className="text-slate-600 text-xs ml-1">
                {session.time}
              </Text>
            </View>
            <View className="flex-row items-center">
              <MapPin size={16} color="#64748b" />
              <Text style={{ fontFamily: 'Poppins_500Medium' }} className="text-slate-600 text-xs ml-1">
                {session.room}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const PendingAcknowledgementsWidget = () => {
  const { data: announcements, isLoading } = useAnnouncements();

  if (isLoading) return null;

  // Filter for unacknowledged announcements
  const pending = announcements?.filter(a => a.require_acknowledgement && !a.is_acknowledged) || [];

  if (pending.length === 0) return null; // Hide widget if nothing is pending!

  return (
    <View className="bg-rose-50 p-5 rounded-3xl mb-6 border border-rose-100">
      <View className="flex-row items-center mb-3">
        <AlertCircle size={20} color="#e11d48" className="mr-2" />
        <View className="ml-2">
          <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-rose-600">
            You have {pending.length} unread {pending.length === 1 ? 'announcement' : 'announcements'}.
          </Text>
        </View>
      </View>
      
      
      {pending.map(item => (
        <View key={item.id} className="bg-white p-3 rounded-xl mb-2 flex-row justify-between items-center border border-red-50">
           <Text style={{ fontFamily: 'Poppins_500Medium' }} className="text-slate-700 flex-1" numberOfLines={1}>
             {item.title}
           </Text>
           {/* You can add navigation to the announcement screen here if desired */}
        </View>
      ))}
    </View>
  );
};

const DashboardScreen = () => {
  const { user, activeRole } = useAuthStore();
  const { data: instructorTrends, isLoading: isLoadingInstructorTrends } = useInstructorAbsenceTrends();
  const { data: programHeadTrends, isLoading: isLoadingProgramHeadTrends } = useAbsenceTrends();

  return (
    <Layout title="Dashboard">
      {activeRole === 'program_head' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* <Text className="font-poppins-semibold text-xl text-slate-700 mb-4">Welcome, {user?.first_name}!</Text> */}
          <AbsenceTrendChart data={programHeadTrends} isLoading={isLoadingProgramHeadTrends} />
          <SectionRiskRanking />
          <AnnouncementComplianceTracker />
        </ScrollView>
      )}
      {activeRole === 'instructor' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* <Text className="font-poppins-semibold text-xl text-slate-700 mb-4">Welcome, {user?.first_name}!</Text> */}
          <PendingAcknowledgementsWidget />
          <ActiveSessionsWidget />
          <AbsenceTrendChart data={instructorTrends} isLoading={isLoadingInstructorTrends} />
        </ScrollView>
      )}
      {activeRole === 'class_officer' && (
        <View>
          <Text className="font-poppins-semibold text-xl text-slate-700 mb-4">Welcome, {user?.first_name}!</Text>
          <Text className="font-poppins-light-it text-gray-400">"She is more precious than rubies: and all the things thou canst desire are not to be compared unto her"</Text>
        </View>
      )}
      {activeRole === 'student' && (
        <View>
          <Text className="font-poppins-semibold text-xl text-slate-700 mb-4">Welcome, {user?.first_name}!</Text>
          <Text className="font-poppins-light-it text-gray-400">"She is more precious than rubies: and all the things thou canst desire are not to be compared unto her"</Text>
        </View>
      )}
    </Layout>
  );
}

export default DashboardScreen;