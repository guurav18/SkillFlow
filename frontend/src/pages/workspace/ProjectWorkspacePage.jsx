import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { milestoneService } from '../../services/milestoneService';
import { businessService } from '../../services/businessService';
import { getSocket } from '../../services/socket';

// Workspace Child Components
import { WorkspaceOverview } from '../../components/workspace/WorkspaceOverview';
import { KanbanBoard } from '../../components/workspace/KanbanBoard';
import { TaskList } from '../../components/workspace/TaskList';
import { MilestoneTracker } from '../../components/workspace/MilestoneTracker';
import { ProjectChat } from '../../components/workspace/ProjectChat';
import { TaskModal } from '../../components/workspace/TaskModal';
import { MilestoneModal } from '../../components/workspace/MilestoneModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { AIHealthPanel } from '../../components/ai/AIHealthPanel';
import { AICopilotPanel } from '../../components/ai/AICopilotPanel';

import {
  Layers,
  Kanban,
  Flag,
  MessageSquare,
  Bot,
  LayoutDashboard,
  ArrowLeft,
  Calendar,
  DollarSign,
  Building2,
  User,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const ProjectWorkspacePage = () => {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskMetrics, setTaskMetrics] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [milestoneMetrics, setMilestoneMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskModalDefaultStatus, setTaskModalDefaultStatus] = useState('todo');
  const [taskModalLoading, setTaskModalLoading] = useState(false);

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [milestoneModalLoading, setMilestoneModalLoading] = useState(false);

  const loadWorkspaceData = async () => {
    try {
      setLoading(true);
      const [projData, tasksData, milestonesData] = await Promise.all([
        projectService.getProjectById(projectId),
        taskService.getProjectTasks(projectId),
        milestoneService.getProjectMilestones(projectId),
      ]);

      setProject(projData.project);
      setTasks(tasksData.tasks || []);
      setTaskMetrics(tasksData.metrics);
      setMilestones(milestonesData.milestones || []);
      setMilestoneMetrics(milestonesData.metrics);
    } catch (err) {
      setError(err.message || 'Failed to load project workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [projectId]);

  // Sync tab with URL search parameter
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Real-time socket sync for Task / Milestone updates
  useEffect(() => {
    const socket = getSocket();
    socket.emit('join_project', { projectId });

    socket.on('task_updated', () => {
      taskService.getProjectTasks(projectId).then((data) => {
        setTasks(data.tasks || []);
        setTaskMetrics(data.metrics);
      });
    });

    socket.on('milestone_updated', () => {
      milestoneService.getProjectMilestones(projectId).then((data) => {
        setMilestones(data.milestones || []);
        setMilestoneMetrics(data.metrics);
      });
    });

    return () => {
      socket.off('task_updated');
      socket.off('milestone_updated');
    };
  }, [projectId]);

  // --- Task Operations ---
  const handleCreateOrEditTask = async (formData) => {
    setTaskModalLoading(true);
    try {
      const socket = getSocket();
      if (editingTask) {
        await taskService.updateTask(editingTask._id, formData);
        socket.emit('task_change', { projectId, task: formData, action: 'updated' });
      } else {
        await taskService.createTask(projectId, {
          ...formData,
          status: formData.status || taskModalDefaultStatus,
        });
        socket.emit('task_change', { projectId, task: formData, action: 'created' });
      }
      const data = await taskService.getProjectTasks(projectId);
      setTasks(data.tasks || []);
      setTaskMetrics(data.metrics);
      setIsTaskModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      throw err;
    } finally {
      setTaskModalLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      const socket = getSocket();
      socket.emit('task_change', { projectId, task: { _id: taskId, status: newStatus }, action: 'status_changed' });
      const data = await taskService.getProjectTasks(projectId);
      setTasks(data.tasks || []);
      setTaskMetrics(data.metrics);
    } catch (err) {
      alert(err.message || 'Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      const socket = getSocket();
      socket.emit('task_change', { projectId, task: { _id: taskId }, action: 'deleted' });
      const data = await taskService.getProjectTasks(projectId);
      setTasks(data.tasks || []);
      setTaskMetrics(data.metrics);
    } catch (err) {
      alert(err.message || 'Failed to delete task.');
    }
  };

  const handleOpenCreateTaskModal = (defaultStatus = 'todo') => {
    setEditingTask(null);
    setTaskModalDefaultStatus(defaultStatus);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // --- Milestone Operations ---
  const handleCreateOrEditMilestone = async (formData) => {
    setMilestoneModalLoading(true);
    try {
      const socket = getSocket();
      if (editingMilestone) {
        await milestoneService.updateMilestone(editingMilestone._id, formData);
        socket.emit('milestone_change', { projectId, milestone: formData, action: 'updated' });
      } else {
        await milestoneService.createMilestone(projectId, formData);
        socket.emit('milestone_change', { projectId, milestone: formData, action: 'created' });
      }
      const data = await milestoneService.getProjectMilestones(projectId);
      setMilestones(data.milestones || []);
      setMilestoneMetrics(data.metrics);
      setIsMilestoneModalOpen(false);
      setEditingMilestone(null);
    } catch (err) {
      throw err;
    } finally {
      setMilestoneModalLoading(false);
    }
  };

  const handleUpdateMilestoneProgress = async (milestoneId, progress) => {
    try {
      await milestoneService.updateMilestone(milestoneId, { progress });
      const socket = getSocket();
      socket.emit('milestone_change', { projectId, milestone: { _id: milestoneId, progress }, action: 'progress_updated' });
      const data = await milestoneService.getProjectMilestones(projectId);
      setMilestones(data.milestones || []);
      setMilestoneMetrics(data.metrics);
    } catch (err) {
      alert(err.message || 'Failed to update milestone.');
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;
    try {
      await milestoneService.deleteMilestone(milestoneId);
      const socket = getSocket();
      socket.emit('milestone_change', { projectId, milestone: { _id: milestoneId }, action: 'deleted' });
      const data = await milestoneService.getProjectMilestones(projectId);
      setMilestones(data.milestones || []);
      setMilestoneMetrics(data.metrics);
    } catch (err) {
      alert(err.message || 'Failed to delete milestone.');
    }
  };

  const handlePayMilestone = async (milestone) => {
    try {
      const orderData = await businessService.createPaymentOrder(projectId, milestone._id);
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Unable to load Razorpay Checkout.'));
          document.body.appendChild(script);
        });
      }
      const checkout = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'WorkFlow AI',
        description: milestone.title,
        order_id: orderData.order.id,
        handler: async (response) => {
          await businessService.verifyPayment(response);
          alert('Payment verified successfully. Your invoice is now available.');
        },
        modal: { ondismiss: () => {} },
      });
      checkout.open();
    } catch (err) {
      alert(err.message || 'Payment could not be started.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to private project workspace..." size="lg" />;
  }

  if (error || !project) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-6">
          <h3 className="font-bold text-lg mb-1">Access Denied / Not Found</h3>
          <p className="text-xs">{error || 'This project workspace does not exist or you do not have permission.'}</p>
        </div>
        <Link to="/">
          <Button variant="secondary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isClient = project.client?._id === user?._id || project.client === user?._id;
  const isFreelancer =
    project.hiredFreelancer?._id === user?._id ||
    project.hiredFreelancer === user?._id;
  const completedTasks = tasks.filter((task) => task.status === 'done').length;
  const taskProgress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const healthLabel = taskProgress >= 70 ? 'On track' : taskProgress >= 35 ? 'Needs attention' : 'Starting well';

  const backLink = isClient ? `/client/projects/${projectId}` : `/freelancer/projects/${projectId}`;

  return (
    <div className="space-y-6">
      {/* Top Workspace Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to={backLink}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Back to Details"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="brand" size="sm">Workspace</Badge>
              <Badge variant="success" size="sm">
                <CheckCircle2 className="w-3 h-3" /> Contract Assigned
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 truncate max-w-xl">
              {project.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#294048] bg-[#122027] px-4 py-3">
          <div className="min-w-[110px]"><p className="eyebrow">Project health</p><p className="mt-1 text-sm font-semibold text-white">{healthLabel}</p></div>
          <div className="w-24"><div className="mb-1 flex justify-between text-[10px] text-slate-400"><span>Progress</span><span className="text-cyan-200">{taskProgress}%</span></div><div className="h-1.5 rounded-full bg-slate-800"><div className="h-1.5 rounded-full bg-cyan-300 transition-all duration-500" style={{ width: `${taskProgress}%` }} /></div></div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Overview
          </button>

          <button
            onClick={() => handleTabChange('copilot')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${activeTab === 'copilot' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Bot className="w-3.5 h-3.5" /> AI
          </button>

          <button
            onClick={() => handleTabChange('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'kanban'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" /> Kanban
          </button>

          <button
            onClick={() => handleTabChange('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Tasks ({tasks.length})
          </button>

          <button
            onClick={() => handleTabChange('milestones')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'milestones'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flag className="w-3.5 h-3.5" /> Milestones ({milestones.length})
          </button>

          <button
            onClick={() => handleTabChange('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Chat
          </button>
        </div>
      </div>

      {/* Main Tab Render */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6"><WorkspaceOverview project={project} taskMetrics={taskMetrics} milestoneMetrics={milestoneMetrics} onTabChange={handleTabChange} isClient={isClient} isFreelancer={isFreelancer} /><AIHealthPanel projectId={projectId} /></div>
        )}

        {activeTab === 'copilot' && <AICopilotPanel projectId={projectId} />}

        {activeTab === 'kanban' && (
          <KanbanBoard
            tasks={tasks}
            onUpdateStatus={handleUpdateTaskStatus}
            onSubmitForReview={async (taskId) => {
              await taskService.submitForReview(taskId);
              const socket = getSocket();
              socket.emit('task_change', { projectId, task: { _id: taskId, status: 'review' }, action: 'submitted_review' });
              const data = await taskService.getProjectTasks(projectId);
              setTasks(data.tasks || []);
              setTaskMetrics(data.metrics);
            }}
            onApproveTask={async (taskId) => {
              await taskService.approveTask(taskId);
              const socket = getSocket();
              socket.emit('task_change', { projectId, task: { _id: taskId, status: 'done' }, action: 'approved' });
              const data = await taskService.getProjectTasks(projectId);
              setTasks(data.tasks || []);
              setTaskMetrics(data.metrics);
            }}
            onRequestChanges={async (taskId, comment) => {
              await taskService.requestChanges(taskId, comment);
              const socket = getSocket();
              socket.emit('task_change', { projectId, task: { _id: taskId, status: 'in_progress', changesRequested: true }, action: 'changes_requested' });
              const data = await taskService.getProjectTasks(projectId);
              setTasks(data.tasks || []);
              setTaskMetrics(data.metrics);
            }}
            onEditTask={handleOpenEditTaskModal}
            onDeleteTask={handleDeleteTask}
            onOpenCreateModal={handleOpenCreateTaskModal}
            isClient={isClient}
            isFreelancer={isFreelancer}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskList
            tasks={tasks}
            onUpdateStatus={handleUpdateTaskStatus}
            onSubmitForReview={async (taskId) => {
              await taskService.submitForReview(taskId);
              const socket = getSocket();
              socket.emit('task_change', { projectId, task: { _id: taskId, status: 'review' }, action: 'submitted_review' });
              const data = await taskService.getProjectTasks(projectId);
              setTasks(data.tasks || []);
              setTaskMetrics(data.metrics);
            }}
            onApproveTask={async (taskId) => {
              await taskService.approveTask(taskId);
              const socket = getSocket();
              socket.emit('task_change', { projectId, task: { _id: taskId, status: 'done' }, action: 'approved' });
              const data = await taskService.getProjectTasks(projectId);
              setTasks(data.tasks || []);
              setTaskMetrics(data.metrics);
            }}
            onRequestChanges={async (taskId, comment) => {
              await taskService.requestChanges(taskId, comment);
              const socket = getSocket();
              socket.emit('task_change', { projectId, task: { _id: taskId, status: 'in_progress', changesRequested: true }, action: 'changes_requested' });
              const data = await taskService.getProjectTasks(projectId);
              setTasks(data.tasks || []);
              setTaskMetrics(data.metrics);
            }}
            onEditTask={handleOpenEditTaskModal}
            onDeleteTask={handleDeleteTask}
            onOpenCreateModal={handleOpenCreateTaskModal}
            isClient={isClient}
            isFreelancer={isFreelancer}
          />
        )}

        {activeTab === 'milestones' && (
          <MilestoneTracker
            milestones={milestones}
            metrics={milestoneMetrics}
            onUpdateProgress={handleUpdateMilestoneProgress}
            onEditMilestone={(m) => {
              setEditingMilestone(m);
              setIsMilestoneModalOpen(true);
            }}
            onDeleteMilestone={handleDeleteMilestone}
            onOpenCreateModal={() => {
              setEditingMilestone(null);
              setIsMilestoneModalOpen(true);
            }}
            isClient={isClient}
            onPayMilestone={handlePayMilestone}
          />
        )}

        {activeTab === 'chat' && <ProjectChat project={project} />}
      </div>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateOrEditTask}
        initialTask={editingTask}
        loading={taskModalLoading}
        projectId={projectId}
      />

      {/* Milestone Creation / Edit Modal */}
      <MilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        onSubmit={handleCreateOrEditMilestone}
        initialMilestone={editingMilestone}
        loading={milestoneModalLoading}
      />
    </div>
  );
};
