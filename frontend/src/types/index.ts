export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  created_at: string;
}

export interface Venue {
  id: number;
  name: string;
  capacity: number;
  location: string;
  contact_info?: string;
}

export interface EventItem {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  venue_id: number;
  capacity: number;
  status: 'ACTIVE' | 'CANCELLED';
  created_by: number;
  venue?: Venue;
  confirmed_registrations_count?: number;
  available_seats?: number;
}

export interface Registration {
  id: number;
  user_id: number;
  event_id: number;
  registered_at: string;
  status: 'CONFIRMED' | 'CANCELLED';
  event?: EventItem;
  user?: User;
}

export interface ToolTrace {
  tool_name: string;
  tool_input: Record<string, any>;
  tool_output: any;
  latency_ms?: number;
}

export interface ChatResponse {
  run_id: string;
  user_prompt: string;
  detected_intent: string;
  final_response: string;
  tool_traces: ToolTrace[];
  latency_ms: number;
}

export interface AgentRunLog {
  id: number;
  run_id: string;
  user_id?: number;
  user_prompt: string;
  detected_intent?: string;
  tools_called?: string;
  tool_results?: string;
  latency_ms: number;
  status: string;
  error_message?: string;
  final_response?: string;
  created_at: string;
}
