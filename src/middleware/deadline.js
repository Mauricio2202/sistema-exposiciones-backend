const DEADLINE = new Date(2026, 5, 15, 23, 59, 0);

export const isSubmissionClosed = () => new Date() > DEADLINE;

export const checkDeadline = (req, res, next) => {
  if (isSubmissionClosed()) {
    return res.status(403).json({
      message: 'El periodo de carga terminó el 15 de junio de 2026 a las 11:59 pm. No se permiten nuevas subidas.'
    });
  }
  next();
};
