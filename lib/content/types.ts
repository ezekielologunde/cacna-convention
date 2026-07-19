// Shared shapes for the sub-conference program content modules
// (business-group, cacma, good-women, ministers-wives, youth,
// christian-education, committee). Introduced to replace each file's
// bespoke agenda/executive/message interfaces (previously: `handler` vs
// `speaker` vs no field at all; executives as loose "Name — Role" strings
// in some files vs {name, role} in others).
export interface Person {
  name: string;
  title?: string;
  role?: string;
}

export interface AgendaItem {
  time?: string;
  event: string;
  speaker?: string;
}

export interface ScheduleSession {
  dayLabel: string;
  timeRange: string;
  agenda: AgendaItem[];
}

export interface ConferenceMessage {
  title: string;
  verse?: string;
  contributors: Person[];
  body: string[];
}
