import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { IProspect, PipelineStage } from '@/types';
import { mockProspects, getProspectsByStage, getQualifiedProspects } from '@/lib/mock-data/prospects';

interface PipelineState {
  // Prospects
  prospects: IProspect[];
  selectedProspect: IProspect | null;
  setSelectedProspect: (prospect: IProspect | null) => void;
  
  // Filtering
  stageFilter: PipelineStage | 'all';
  setStageFilter: (stage: PipelineStage | 'all') => void;
  industryFilter: string | 'all';
  setIndustryFilter: (industry: string | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Sorting
  sortBy: 'score' | 'date' | 'name' | 'value';
  sortOrder: 'asc' | 'desc';
  setSorting: (sortBy: PipelineState['sortBy'], order: 'asc' | 'desc') => void;
  
  // Actions
  moveProspect: (prospectId: string, newStage: PipelineStage) => void;
  updateProspectScore: (prospectId: string, score: number) => void;
  addProspect: (prospect: Omit<IProspect, 'id'>) => void;
  deleteProspect: (prospectId: string) => void;
  
  // Bulk actions
  selectedProspectIds: Set<string>;
  toggleProspectSelection: (prospectId: string) => void;
  selectAllProspects: () => void;
  clearSelection: () => void;
  bulkMoveProspects: (newStage: PipelineStage) => void;
  
  // Research
  researchQueue: string[];
  addToResearchQueue: (prospectId: string) => void;
  removeFromResearchQueue: (prospectId: string) => void;
  isResearching: boolean;
  setIsResearching: (researching: boolean) => void;
  
  // Computed values
  getFilteredProspects: () => IProspect[];
  getStageCount: (stage: PipelineStage) => number;
}

export const usePipelineStore = create<PipelineState>()(
  devtools(
    (set, get) => ({
      // Prospects
      prospects: mockProspects,
      selectedProspect: null,
      setSelectedProspect: (prospect) => set({ selectedProspect: prospect }),
      
      // Filtering
      stageFilter: 'all',
      setStageFilter: (stage) => set({ stageFilter: stage }),
      industryFilter: 'all',
      setIndustryFilter: (industry) => set({ industryFilter: industry }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // Sorting
      sortBy: 'score',
      sortOrder: 'desc',
      setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
      
      // Actions
      moveProspect: (prospectId, newStage) => set((state) => ({
        prospects: state.prospects.map(p => 
          p.id === prospectId ? { ...p, pipelineStage: newStage } : p
        )
      })),
      
      updateProspectScore: (prospectId, score) => set((state) => ({
        prospects: state.prospects.map(p => 
          p.id === prospectId 
            ? { 
                ...p, 
                qualificationScore: { 
                  ...p.qualificationScore, 
                  total: score,
                  qualificationLevel: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
                  lastUpdated: new Date()
                } 
              } 
            : p
        )
      })),
      
      addProspect: (prospect) => set((state) => ({
        prospects: [
          ...state.prospects,
          { ...prospect, id: `prospect-${Date.now()}` } as IProspect
        ]
      })),
      
      deleteProspect: (prospectId) => set((state) => ({
        prospects: state.prospects.filter(p => p.id !== prospectId),
        selectedProspect: state.selectedProspect?.id === prospectId ? null : state.selectedProspect
      })),
      
      // Bulk actions
      selectedProspectIds: new Set(),
      toggleProspectSelection: (prospectId) => set((state) => {
        const newSet = new Set(state.selectedProspectIds);
        if (newSet.has(prospectId)) {
          newSet.delete(prospectId);
        } else {
          newSet.add(prospectId);
        }
        return { selectedProspectIds: newSet };
      }),
      
      selectAllProspects: () => set((state) => ({
        selectedProspectIds: new Set(state.getFilteredProspects().map(p => p.id))
      })),
      
      clearSelection: () => set({ selectedProspectIds: new Set() }),
      
      bulkMoveProspects: (newStage) => set((state) => ({
        prospects: state.prospects.map(p => 
          state.selectedProspectIds.has(p.id) 
            ? { ...p, pipelineStage: newStage }
            : p
        ),
        selectedProspectIds: new Set()
      })),
      
      // Research
      researchQueue: [],
      addToResearchQueue: (prospectId) => set((state) => ({
        researchQueue: [...state.researchQueue, prospectId]
      })),
      removeFromResearchQueue: (prospectId) => set((state) => ({
        researchQueue: state.researchQueue.filter(id => id !== prospectId)
      })),
      isResearching: false,
      setIsResearching: (researching) => set({ isResearching: researching }),
      
      // Computed values
      getFilteredProspects: () => {
        const state = get();
        let filtered = [...state.prospects];
        
        // Stage filter
        if (state.stageFilter !== 'all') {
          filtered = filtered.filter(p => p.pipelineStage === state.stageFilter);
        }
        
        // Industry filter
        if (state.industryFilter !== 'all') {
          filtered = filtered.filter(p => p.business.industry === state.industryFilter);
        }
        
        // Search
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(p => 
            p.business.name.toLowerCase().includes(query) ||
            p.contact.primaryContact.toLowerCase().includes(query) ||
            p.business.location.city.toLowerCase().includes(query)
          );
        }
        
        // Sort
        filtered.sort((a, b) => {
          let compareValue = 0;
          
          switch (state.sortBy) {
            case 'score':
              compareValue = a.qualificationScore.total - b.qualificationScore.total;
              break;
            case 'date':
              compareValue = a.createdAt.getTime() - b.createdAt.getTime();
              break;
            case 'name':
              compareValue = a.business.name.localeCompare(b.business.name);
              break;
            case 'value':
              compareValue = (a.business.size?.estimatedRevenue || 0) - (b.business.size?.estimatedRevenue || 0);
              break;
          }
          
          return state.sortOrder === 'asc' ? compareValue : -compareValue;
        });
        
        return filtered;
      },
      
      getStageCount: (stage) => {
        const state = get();
        return state.prospects.filter(p => p.pipelineStage === stage).length;
      },
    })
  )
);