import React, { useEffect, useState } from "react";
import {
  User,
  Clock,
  Search,
  Users,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Participant {
  participant_name: string;
  timestamp: string;
  notes?: string;
}

interface Training {
  id: string;
  title: string;
  total_participants: number;
  start_time?: string;
  end_time?: string;
  location?: string;
}

interface Employee {
  id: number;
  name: string;
  department: string;
}

interface AttendanceListProps {
  refreshTrigger?: number;
  employeesPerPage?: number;
  trainingsPerPage?: number;
}

const AttendanceList: React.FC<AttendanceListProps> = ({
  refreshTrigger,
  employeesPerPage = 10,
  trainingsPerPage = 5,
}) => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrainingId, setExpandedTrainingId] = useState<string | null>(
    null
  );
  const [expandedEmployeeIds, setExpandedEmployeeIds] = useState<Set<string>>(
    new Set()
  );
  const [participantsMap, setParticipantsMap] = useState<
    Record<string, Participant[]>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [trainingPage, setTrainingPage] = useState(1);
  const [employeePageMap, setEmployeePageMap] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [trainingsRes, employeesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE}/api/attendance/list`),
          fetch(`${import.meta.env.VITE_API_BASE}/api/employees`),
        ]);

        const trainingsData = await trainingsRes.json();
        const employeesData = await employeesRes.json();

        setTrainings(trainingsData);
        setAllEmployees(employeesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const fetchParticipants = async (trainingId: string) => {
    if (participantsMap[trainingId]) return;

    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_BASE
        }/api/attendance/${trainingId}/participants`
      );
      let data: Participant[] = await res.json();

      // Remove duplicates based on participant_name
      const uniqueMap: Record<string, Participant> = {};
      data.forEach((p) => {
        if (!uniqueMap[p.participant_name]) uniqueMap[p.participant_name] = p;
      });
      data = Object.values(uniqueMap);

      setParticipantsMap((prev) => ({ ...prev, [trainingId]: data }));
      setEmployeePageMap((prev) => ({ ...prev, [trainingId]: 1 }));
    } catch (err) {
      console.error(err);
      setParticipantsMap((prev) => ({ ...prev, [trainingId]: [] }));
      setEmployeePageMap((prev) => ({ ...prev, [trainingId]: 1 }));
    }
  };

  // Filter trainings based on search term
  const filteredTrainings = trainings.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get employees who attended a specific training
  const getAttendingEmployees = (trainingId: string): Employee[] => {
    const participants = participantsMap[trainingId] || [];
    const participantNames = participants.map((p) => p.participant_name);

    return allEmployees.filter((employee) =>
      participantNames.includes(employee.name)
    );
  };

  // Get participant details for a specific employee in a training
  const getParticipantDetails = (
    trainingId: string,
    employeeName: string
  ): Participant | undefined => {
    return participantsMap[trainingId]?.find(
      (p) => p.participant_name === employeeName
    );
  };

  // Toggle employee expansion
  const toggleEmployeeExpansion = (employeeId: string) => {
    setExpandedEmployeeIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalTrainingPages = Math.ceil(
    filteredTrainings.length / trainingsPerPage
  );
  const startTrainingIdx = (trainingPage - 1) * trainingsPerPage;
  const currentTrainings = filteredTrainings.slice(
    startTrainingIdx,
    startTrainingIdx + trainingsPerPage
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Memuat data kehadiran...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="h-6 w-6 mr-2 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Daftar Karyawan yang Hadir
          </h3>
        </div>
        <div className="text-sm text-gray-500">
          Total {filteredTrainings.length} Pelatihan
        </div>
      </div>

      {/* Search Box for Trainings */}
      <div className="flex items-center mb-6 border border-gray-300 rounded-lg px-3 py-3 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <Search className="h-4 w-4 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Cari pelatihan..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setTrainingPage(1);
          }}
          className="flex-1 outline-none text-sm bg-transparent"
        />
      </div>

      {/* List Pelatihan dengan Karyawan yang Hadir */}
      <div className="space-y-4">
        {currentTrainings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>Tidak ada pelatihan yang ditemukan</p>
          </div>
        ) : (
          currentTrainings.map((training) => {
            const attendingEmployees = getAttendingEmployees(training.id);
            const currentEmployeePage = employeePageMap[training.id] || 1;
            const totalEmployeePages = Math.ceil(
              attendingEmployees.length / employeesPerPage
            );
            const startEmployeeIdx =
              (currentEmployeePage - 1) * employeesPerPage;
            const currentEmployees = attendingEmployees.slice(
              startEmployeeIdx,
              startEmployeeIdx + employeesPerPage
            );

            return (
              <div
                key={training.id}
                className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Training Header */}
                <div
                  className="flex justify-between items-center p-6 cursor-pointer hover:bg-white transition-colors duration-200"
                  onClick={() => {
                    setExpandedTrainingId(
                      expandedTrainingId === training.id ? null : training.id
                    );
                    if (expandedTrainingId !== training.id)
                      fetchParticipants(training.id);
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <BookOpen className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-md font-semibold text-gray-900 mb-1">
                          {training.title}
                        </h4>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {training.total_participants} peserta hadir
                            </span>
                          </div>
                          {training.start_time && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(training.start_time)}</span>
                            </div>
                          )}
                          {training.location && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{training.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-blue-600 font-bold text-xl select-none ml-4">
                    {expandedTrainingId === training.id ? "−" : "+"}
                  </div>
                </div>

                {/* Employee List */}
                {expandedTrainingId === training.id && (
                  <div className="border-t border-gray-200 bg-white p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-semibold text-gray-900">
                        Karyawan yang Hadir ({attendingEmployees.length} orang)
                      </h5>
                    </div>

                    {attendingEmployees.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-2 opacity-40" />
                        <p>Belum ada karyawan yang hadir</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 mb-4">
                          {currentEmployees.map((employee) => {
                            const participantDetails = getParticipantDetails(
                              training.id,
                              employee.name
                            );
                            const isExpanded = expandedEmployeeIds.has(
                              employee.id.toString()
                            );

                            return (
                              <div
                                key={employee.id}
                                className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                              >
                                {/* Employee Header */}
                                <div
                                  className="flex items-center justify-between p-4 cursor-pointer"
                                  onClick={() =>
                                    toggleEmployeeExpansion(
                                      employee.id.toString()
                                    )
                                  }
                                >
                                  <div className="flex items-center space-x-3 flex-1">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                      <User className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">
                                        {employee.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {employee.department}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Hadir
                                    </span>
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-gray-400" />
                                    )}
                                  </div>
                                </div>

                                {/* Employee Details */}
                                {isExpanded && participantDetails && (
                                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <Clock className="h-4 w-4 text-gray-500" />
                                          <div>
                                            <p className="font-medium text-gray-700">
                                              Waktu Absensi
                                            </p>
                                            <p className="text-gray-600">
                                              {formatDate(
                                                participantDetails.timestamp
                                              )}
                                            </p>
                                            <p className="text-gray-600">
                                              {formatTime(
                                                participantDetails.timestamp
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        {participantDetails.notes && (
                                          <div>
                                            <p className="font-medium text-gray-700 mb-1">
                                              Catatan
                                            </p>
                                            <p className="text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                                              {participantDetails.notes}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Employee Pagination */}
                        {totalEmployeePages > 1 && (
                          <div className="flex justify-center items-center space-x-2 mt-4">
                            <button
                              onClick={() =>
                                setEmployeePageMap((prev) => ({
                                  ...prev,
                                  [training.id]: Math.max(
                                    1,
                                    currentEmployeePage - 1
                                  ),
                                }))
                              }
                              disabled={currentEmployeePage === 1}
                              className="px-3 py-1 rounded-lg border border-gray-300 text-sm bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Previous
                            </button>

                            {Array.from(
                              { length: Math.min(5, totalEmployeePages) },
                              (_, i) => {
                                let pageNum;
                                if (totalEmployeePages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentEmployeePage <= 3) {
                                  pageNum = i + 1;
                                } else if (
                                  currentEmployeePage >=
                                  totalEmployeePages - 2
                                ) {
                                  pageNum = totalEmployeePages - 4 + i;
                                } else {
                                  pageNum = currentEmployeePage - 2 + i;
                                }

                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() =>
                                      setEmployeePageMap((prev) => ({
                                        ...prev,
                                        [training.id]: pageNum,
                                      }))
                                    }
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                      currentEmployeePage === pageNum
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              }
                            )}

                            <button
                              onClick={() =>
                                setEmployeePageMap((prev) => ({
                                  ...prev,
                                  [training.id]: Math.min(
                                    totalEmployeePages,
                                    currentEmployeePage + 1
                                  ),
                                }))
                              }
                              disabled={
                                currentEmployeePage === totalEmployeePages
                              }
                              className="px-3 py-1 rounded-lg border border-gray-300 text-sm bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Training Pagination */}
        {totalTrainingPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => setTrainingPage(Math.max(1, trainingPage - 1))}
              disabled={trainingPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: totalTrainingPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setTrainingPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    trainingPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() =>
                setTrainingPage(Math.min(totalTrainingPages, trainingPage + 1))
              }
              disabled={trainingPage === totalTrainingPages}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceList;
