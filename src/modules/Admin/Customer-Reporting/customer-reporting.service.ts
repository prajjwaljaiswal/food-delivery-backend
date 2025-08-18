import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CustomerReportsService {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async getTopCustomers(by: 'orders' | 'amount', limit: number) {
        const orderByField = by === 'orders' ? 'COUNT(o.id)' : 'SUM(o.totalAmount)';

        const result = await this.dataSource.query(
            `
  SELECT 
    u.id AS customer_id,
    u.first_name,
    u.last_name,
    CONCAT(u.first_name, ' ', u.last_name) AS name,
    u.email,
    COUNT(o.id) AS total_orders,
    SUM(o.totalAmount) AS total_spent
  FROM users u
  JOIN \`order\` o ON o.userId = u.id
  GROUP BY u.id
  ORDER BY ${orderByField} DESC
  LIMIT ?
  `,
            [limit]
        );


        return result;
    }

    async getNewVsReturningUsers() {
        const result = await this.dataSource.query(
            `
      SELECT
        CASE 
          WHEN sub.total_orders = 1 THEN 'New'
          ELSE 'Returning'
        END AS customer_type,
        COUNT(*) AS count
      FROM (
        SELECT userId, COUNT(*) AS total_orders
        FROM \`order\`
        GROUP BY userId
      ) sub
      GROUP BY customer_type
      `
        );

        return result;
    }

    async getCustomerLifetimeValue() {
        const result = await this.dataSource.query(
            `
      SELECT 
        COUNT(DISTINCT userId) AS total_customers,
        SUM(totalAmount) AS total_revenue,
        ROUND(SUM(totalAmount) / COUNT(DISTINCT userId), 2) AS avg_lifetime_value
      FROM \`order\`
      `
        );

        return result[0]; // returning single row object
    }
}
