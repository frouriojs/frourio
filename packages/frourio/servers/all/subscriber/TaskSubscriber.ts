import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm'
import { Task } from '../entity/Task'

@EventSubscriber()
export class TaskSubscriber implements EntitySubscriberInterface<Task> {
  listenTo() {
    return Task
  }

  afterInsert(event: InsertEvent<Task>) {
    console.log(event)
  }
}
