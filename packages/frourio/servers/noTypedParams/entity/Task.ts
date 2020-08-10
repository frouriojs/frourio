import { Entity, PrimaryColumn, Column } from 'typeorm'

@Entity()
export class Task {
  @PrimaryColumn()
  id: number

  @Column({ length: 100 })
  label: string

  @Column({ default: false })
  done: boolean
}
