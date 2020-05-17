export class Reimbursement {
  author: number | string;
  amount: number;
  date_submitted: string;
  description: string;
  status: number | string;
  type: number | string;
  id?: number;
  date_resolved?: string;
  resolver?: number;
  constructor(
    author: number,
    amount: number,
    date_submitted: string,
    description: string,
    status: number | string,
    type: number | string,
    id?: number,
    date_resolved?: string,
    resolver?: number
  ) {
    this.author = author;
    this.amount = amount;
    this.date_submitted = date_submitted;
    this.description = description;
    this.status = status;
    this.type = type;
    this.id = id;
    this.date_resolved = date_resolved;
    this.resolver = resolver;
  }
}
