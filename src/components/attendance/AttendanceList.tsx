  import React, { useEffect, useState } from "react";
  import { User, Clock, Search } from "lucide-react";

  interface Participant {
    participant_name: string;
    timestamp: string;
    notes?: string;
  }

  interface Training {
    id: string;
    title: string;
    total_participants: number;
  }

  interface AttendanceListProps {
    refreshTrigger?: number;
    participantsPerPage?: number;
    trainingsPerPage?: number;
  }

  const AttendanceList: React.FC<AttendanceListProps> = ({
    refreshTrigger,
    participantsPerPage = 5,
    trainingsPerPage = 3,
  }) => {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [participantsMap, setParticipantsMap] = useState<Record<string, Participant[]>>({});
    const [participantsPageMap, setParticipantsPageMap] = useState<Record<string, number>>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [trainingPage, setTrainingPage] = useState(1);

    useEffect(() => {
      setLoading(true);
      fetch("http://localhost:4000/api/attendance/list")
        .then((res) => res.json())
        .then((data) => setTrainings(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [refreshTrigger]);

    const fetchParticipants = async (trainingId: string) => {
      if (participantsMap[trainingId]) return;
      try {
        const res = await fetch(`http://localhost:4000/api/attendance/${trainingId}/participants`);
        let data: Participant[] = await res.json();
        const uniqueMap: Record<string, Participant> = {};
        data.forEach((p) => { if (!uniqueMap[p.participant_name]) uniqueMap[p.participant_name] = p; });
        data = Object.values(uniqueMap);
        setParticipantsMap((prev) => ({ ...prev, [trainingId]: data }));
        setParticipantsPageMap((prev) => ({ ...prev, [trainingId]: 1 }));
      } catch (err) {
        console.error(err);
        setParticipantsMap((prev) => ({ ...prev, [trainingId]: [] }));
        setParticipantsPageMap((prev) => ({ ...prev, [trainingId]: 1 }));
      }
    };

    const filteredTrainings = trainings.filter((t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalTrainingPages = Math.ceil(filteredTrainings.length / trainingsPerPage);
    const startTrainingIdx = (trainingPage - 1) * trainingsPerPage;
    const currentTrainings = filteredTrainings.slice(startTrainingIdx, startTrainingIdx + trainingsPerPage);

    if (loading) return <div className="text-gray-500 p-8">Loading attendance...</div>;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-cente">
          <User className="h-5 w-5 mr-2 text-blue-600" />
          Absensi Pelatihan
        </h3>

        {/* Search Box */}
        <div className="flex items-center mb-6 border rounded-lg px-3 py-3 bg-gray-50">
          <Search className="h-4 w-4 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Cari pelatihan..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setTrainingPage(1); // reset page search
            }}
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>

        {/* List Pelatihan */}
        <div className="space-y-4 max-h-[500px] overflow-auto">
          {currentTrainings.length === 0 && (
            <p className="text-gray-500 text-sm">Belum ada data pelatihan.</p>
          )}

          {currentTrainings.map((t) => {
            const participants = participantsMap[t.id] || [];
            const currentPage = participantsPageMap[t.id] || 1;
            const totalPages = Math.ceil(participants.length / participantsPerPage);
            const startIdx = (currentPage - 1) * participantsPerPage;
            const currentParticipants = participants.slice(startIdx, startIdx + participantsPerPage);

            return (
              <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[150px]">
                {/* Header Pelatihan */}
                <div
                  className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => {
                    setExpandedId(expandedId === t.id ? null : t.id);
                    if (expandedId !== t.id) fetchParticipants(t.id);
                  }}
                >
                  <div>
                    <h4 className="text-md font-semibold text-gray-900">{t.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Total Peserta: <span className="font-medium">{t.total_participants}</span>
                    </p>
                  </div>
                  <div className="text-blue-600 font-bold text-xl select-none">
                    {expandedId === t.id ? "−" : "+"}
                  </div>
                </div>

                {/* Peserta */}
                {expandedId === t.id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-2 max-h-[250px] overflow-auto">
                    {participants.length === 0 ? (
                      <p className="text-gray-500 text-sm">Belum ada peserta yang absen.</p>
                    ) : currentParticipants.map((p, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center mb-1 sm:mb-0">
                          <User className="h-5 w-5 mr-2 text-blue-600" />
                          <span className="font-medium text-gray-900">{p.participant_name}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-1 sm:mb-0">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{new Date(p.timestamp).toLocaleString()}</span>
                        </div>
                        {p.notes && (
                          <p className="text-gray-700 bg-gray-100 p-1 rounded text-sm w-full sm:w-auto mt-1 sm:mt-0">
                            {p.notes}
                          </p>
                        )}
                      </div>
                    ))}

                    {/* Pagination Peserta */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center space-x-1 mt-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() =>
                              setParticipantsPageMap((prev) => ({ ...prev, [t.id]: pageNum }))
                            }
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-200 ${
                              currentPage === pageNum
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-green-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination Pelatihan */}
          {totalTrainingPages > 1 && (
            <div className="flex justify-center items-center space-x-1 mt-4">
              {Array.from({ length: totalTrainingPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setTrainingPage(page)}
                  className={`px-3 py-1 rounded-lg border text-sm ${
                    trainingPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  export default AttendanceList;
