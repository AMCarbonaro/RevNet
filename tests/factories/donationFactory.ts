import { Donation } from '@/types';

export class DonationFactory {
  static create(overrides: Partial<Donation> = {}): Donation {
    const defaultDonation: Donation = {
      _id: Math.random().toString(36).substr(2, 9),
      amount: 50,
      donor: 'test-user-id',
      project: 'test-project-id',
      status: 'completed',
      paymentMethod: 'stripe',
      paymentIntentId: 'pi_test_123',
      transactionId: 'txn_test_123',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: new Date(),
      refundedAt: null,
      refundedBy: null,
      refundReason: null,
      isAnonymous: false,
      message: 'Thank you for your work!'
    };

    return { ...defaultDonation, ...overrides };
  }

  static createPending(overrides: Partial<Donation> = {}): Donation {
    return this.create({
      status: 'pending',
      completedAt: null,
      ...overrides
    });
  }

  static createFailed(overrides: Partial<Donation> = {}): Donation {
    return this.create({
      status: 'failed',
      completedAt: null,
      ...overrides
    });
  }

  static createRefunded(overrides: Partial<Donation> = {}): Donation {
    return this.create({
      status: 'refunded',
      refundedAt: new Date(),
      refundedBy: 'admin-user-id',
      refundReason: 'Donor requested refund',
      ...overrides
    });
  }

  static createAnonymous(overrides: Partial<Donation> = {}): Donation {
    return this.create({
      isAnonymous: true,
      message: null,
      ...overrides
    });
  }

  static createLarge(overrides: Partial<Donation> = {}): Donation {
    return this.create({
      amount: 1000,
      ...overrides
    });
  }

  static createSmall(overrides: Partial<Donation> = {}): Donation {
    return this.create({
      amount: 5,
      ...overrides
    });
  }

  static createMany(count: number, overrides: Partial<Donation> = {}): Donation[] {
    return Array.from({ length: count }, (_, index) => 
      this.create({
        amount: 50 + (index * 10),
        donor: `user-${index + 1}`,
        project: `project-${index + 1}`,
        ...overrides
      })
    );
  }

  static createForProject(projectId: string, overrides: Partial<Donation> = {}): Donation {
    return this.create({
      project: projectId,
      ...overrides
    });
  }

  static createByUser(userId: string, overrides: Partial<Donation> = {}): Donation {
    return this.create({
      donor: userId,
      ...overrides
    });
  }

  static createWithPaymentMethod(paymentMethod: string, overrides: Partial<Donation> = {}): Donation {
    return this.create({
      paymentMethod,
      ...overrides
    });
  }
}
