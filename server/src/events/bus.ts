import { EventEmitter } from "node:events";
import type { Chore, Person } from "@office-chores/shared";

export type DomainEvent =
  | { type: "chore.created"; chore: Chore }
  | { type: "chore.updated"; chore: Chore }
  | { type: "chore.deleted"; id: string }
  | { type: "person.created"; person: Person }
  | { type: "person.updated"; person: Person }
  | { type: "person.deleted"; id: string };

export type DomainEventType = DomainEvent["type"];

class TypedBus {
  private readonly emitter = new EventEmitter();

  emit(event: DomainEvent): void {
    this.emitter.emit(event.type, event);
    this.emitter.emit("*", event);
  }

  on<T extends DomainEventType>(
    type: T,
    handler: (event: Extract<DomainEvent, { type: T }>) => void,
  ): () => void {
    this.emitter.on(type, handler as (e: DomainEvent) => void);
    return () => this.emitter.off(type, handler as (e: DomainEvent) => void);
  }

  onAny(handler: (event: DomainEvent) => void): () => void {
    this.emitter.on("*", handler);
    return () => this.emitter.off("*", handler);
  }
}

export const bus = new TypedBus();
export type { TypedBus };
