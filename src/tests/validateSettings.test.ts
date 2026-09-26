import { validateSettings } from '../middleware/validateSettings';

function mockReq(body: unknown) {
  return { body } as any;
}

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;
}

function mockNext() {
  return jest.fn() as any;
}

describe('validateSettings middleware', () => {
  it('returns 400 for null body', () => {
    const req = mockReq(null);
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  it('returns 400 for empty object body', () => {
    const req = mockReq({});
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  it('returns 400 for unknown fields', () => {
    const req = mockReq({ unknownField: 'value' });
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Unknown field') }));
  });

  it('returns 400 for invalid email format', () => {
    const req = mockReq({ supportEmail: 'not-an-email' });
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for negative numbers in numeric fields', () => {
    const req = mockReq({ maxTicketsPerOrder: -1 });
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for out-of-range values', () => {
    const req = mockReq({ maxTicketsPerOrder: 2000 });
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when enableNotifications is not a boolean', () => {
    const req = mockReq({ enableNotifications: 'yes' });
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('calls next() for valid input', () => {
    const req = mockReq({ supportEmail: 'test@example.com', companyName: 'TestCo' });
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('allows partial body with missing fields', () => {
    const req = mockReq({ supportEmail: 'test@example.com' });
    const res = mockRes();
    const next = mockNext();

    validateSettings(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
