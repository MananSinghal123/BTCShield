import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  Clock,
  Shield,
} from "lucide-react";
import { useAllOptions } from "@/hooks/useAllOptions";
import {
  BackstopOption,
  OptionPhase,
  useRcoManager,
} from "@/hooks/useRcoManager";
import OptionCard from "./backstop/OptionCard";

const OptionsList = () => {
  const { fetchAvailableOptions, address } = useAllOptions();
  const [options, setOptions] = useState<BackstopOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<BackstopOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<"all" | OptionPhase>("all");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "borrower" | "supporter"
  >("all");
  const [sortBy, setSortBy] = useState<"maturity" | "premium" | "startTime">(
    "maturity"
  );
  const { terminateEarly, support, defaultOption, exercise } = useRcoManager();
  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [options, searchQuery, phaseFilter, roleFilter, sortBy]);

  const loadOptions = async () => {
    setIsLoading(true);
    try {
      const fetchedOptions = await fetchAvailableOptions();
      setOptions(fetchedOptions);
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...options];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (opt) =>
          opt.borrower.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opt.supporter.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Phase filter
    if (phaseFilter !== "all") {
      filtered = filtered.filter((opt) => opt.phase === phaseFilter);
    }

    // Role filter
    if (roleFilter !== "all" && address) {
      filtered = filtered.filter((opt) => {
        if (roleFilter === "borrower") {
          return opt.borrower.toLowerCase() === address.toLowerCase();
        } else {
          return opt.supporter.toLowerCase() === address.toLowerCase();
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "maturity":
          return a.maturityTime - b.maturityTime;
        case "premium":
          return parseFloat(b.premium) - parseFloat(a.premium);
        case "startTime":
          return b.startTime - a.startTime;
        default:
          return 0;
      }
    });

    setFilteredOptions(filtered);
  };

  const getUserRole = (
    option: BackstopOption
  ): "borrower" | "supporter" | "none" => {
    if (!address) return "none";
    if (option.borrower.toLowerCase() === address.toLowerCase())
      return "borrower";
    if (option.supporter.toLowerCase() === address.toLowerCase())
      return "supporter";
    return "none";
  };

  const getPhaseLabel = (phase: OptionPhase) => {
    switch (phase) {
      case OptionPhase.Initialization:
        return "Initialization";
      case OptionPhase.PreMaturity:
        return "Pre-Maturity";
      case OptionPhase.Maturity:
        return "Maturity";
      case OptionPhase.Exercised:
        return "Exercised";
      case OptionPhase.Defaulted:
        return "Defaulted";
      case OptionPhase.Terminated:
        return "Terminated";
      default:
        return "Unknown";
    }
  };

  const stats = {
    total: options.length,
    active: options.filter(
      (o) =>
        o.phase === OptionPhase.PreMaturity ||
        o.phase === OptionPhase.Initialization
    ).length,
    matured: options.filter((o) => o.phase === OptionPhase.Maturity).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mezo-dark-950 via-mezo-dark-900 to-mezo-dark-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-mezo-dark-50 mb-2">
                Options Market
              </h1>
              <p className="text-mezo-dark-300">
                Browse and support lending positions in the marketplace
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadOptions}
              disabled={isLoading}
              className="btc-button bg-gradient-to-r from-mezo-btc-500 to-mezo-btc-600 flex items-center space-x-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="institutional-card">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-mezo-dark-300">Total Options</p>
                  <p className="text-2xl font-bold text-mezo-dark-50">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
            <div className="institutional-card">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-mezo-dark-300">Active Options</p>
                  <p className="text-2xl font-bold text-mezo-dark-50">
                    {stats.active}
                  </p>
                </div>
              </div>
            </div>
            <div className="institutional-card">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-orange-500/10">
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-mezo-dark-300">Matured Options</p>
                  <p className="text-2xl font-bold text-mezo-dark-50">
                    {stats.matured}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="institutional-card mb-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-mezo-btc-500" />
            <h2 className="text-lg font-semibold text-mezo-dark-50">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mezo-dark-400" />
              <input
                type="text"
                placeholder="Search address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-mezo-dark-800 border border-mezo-dark-700 rounded-lg text-mezo-dark-50 placeholder-mezo-dark-400 focus:outline-none focus:border-mezo-btc-500"
              />
            </div>

            {/* Phase Filter */}
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value as any)}
              className="px-4 py-2 bg-mezo-dark-800 border border-mezo-dark-700 rounded-lg text-mezo-dark-50 focus:outline-none focus:border-mezo-btc-500"
            >
              <option value="all">All Phases</option>
              <option value={OptionPhase.Initialization}>Initialization</option>
              <option value={OptionPhase.PreMaturity}>Pre-Maturity</option>
              <option value={OptionPhase.Maturity}>Maturity</option>
              <option value={OptionPhase.Exercised}>Exercised</option>
              <option value={OptionPhase.Defaulted}>Defaulted</option>
              <option value={OptionPhase.Terminated}>Terminated</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2 bg-mezo-dark-800 border border-mezo-dark-700 rounded-lg text-mezo-dark-50 focus:outline-none focus:border-mezo-btc-500"
            >
              <option value="all">All Roles</option>
              <option value="borrower">My Borrower Options</option>
              <option value="supporter">My Supporter Options</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-mezo-dark-800 border border-mezo-dark-700 rounded-lg text-mezo-dark-50 focus:outline-none focus:border-mezo-btc-500"
            >
              <option value="maturity">Sort by Maturity</option>
              <option value="premium">Sort by Premium</option>
              <option value="startTime">Sort by Start Time</option>
            </select>
          </div>
        </motion.div>

        {/* Options List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-mezo-btc-500 animate-spin" />
          </div>
        ) : filteredOptions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="institutional-card text-center py-12"
          >
            <Shield className="w-16 h-16 text-mezo-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-mezo-dark-300 mb-2">
              No Options Found
            </h3>
            <p className="text-mezo-dark-400">
              {options.length === 0
                ? "No options available yet. Check back later!"
                : "Try adjusting your filters to see more options."}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOptions.map((option, index) => (
              <motion.div
                key={`${option.borrower}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <OptionCard
                  option={option}
                  userRole={getUserRole(option)}
                  onTerminateEarly={(terminationFee) =>
                    terminateEarly(terminationFee || 0)
                  }
                  onExercise={() => exercise(option.borrower)}
                  onDefault={() => defaultOption(option.borrower)}
                  onSupport={() => support(option.borrower, option.premium)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionsList;
