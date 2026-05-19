import PDFDocument from "pdfkit";
import db from "../config/db.js";

export const logAdminActivity = async ({ adminUserId, actionType, actionTarget, targetId = null, details = "" }) => {
  await db.query(
    `INSERT INTO admin_activity (admin_user_id, action_type, action_target, target_id, details)
     VALUES (?, ?, ?, ?, ?)`,
    [adminUserId, actionType, actionTarget, targetId, details]
  );
};

export const getDashboardStats = async () => {
  const [[userTotals]] = await db.query(
    `SELECT
      COUNT(*) AS totalUsers,
      SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS totalAdmins,
      SUM(CASE WHEN isBlocked = 1 THEN 1 ELSE 0 END) AS blockedUsers
     FROM users`
  );

  const [[itemTotals]] = await db.query(
    `SELECT
      COUNT(*) AS totalItems,
      SUM(CASE WHEN moderation_status = 'approved' THEN 1 ELSE 0 END) AS approvedItems,
      SUM(CASE WHEN moderation_status = 'pending' THEN 1 ELSE 0 END) AS pendingItems,
      SUM(CASE WHEN moderation_status = 'rejected' THEN 1 ELSE 0 END) AS rejectedItems,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolvedItems,
      SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS openItems
     FROM items`
  );

  const [[reportTotals]] = await db.query(
    `SELECT
      COUNT(*) AS totalReports,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingReports,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approvedReports,
      SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) AS dismissedReports
     FROM item_reports`
  );

  const [itemsByDay] = await db.query(
    `SELECT DATE(created_at) AS bucket, COUNT(*) AS total
     FROM items
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     GROUP BY DATE(created_at)
     ORDER BY bucket ASC`
  );

  const [usersByDay] = await db.query(
    `SELECT DATE(createdAt) AS bucket, COUNT(*) AS total
     FROM users
     WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     GROUP BY DATE(createdAt)
     ORDER BY bucket ASC`
  );

  const [recentActivity] = await db.query(
    `SELECT
      a.activity_id,
      a.action_type,
      a.action_target,
      a.target_id,
      a.details,
      a.created_at,
      u.fullName AS admin_name
     FROM admin_activity a
     LEFT JOIN users u ON u.userId = a.admin_user_id
     ORDER BY a.created_at DESC
     LIMIT 12`
  );

  return {
    ...userTotals,
    ...itemTotals,
    ...reportTotals,
    itemsByDay,
    usersByDay,
    recentActivity,
  };
};

export const listReportsForAdmin = async ({ status = "all" } = {}) => {
  const where = [];
  const params = [];

  if (status !== "all") {
    where.push("r.status = ?");
    params.push(status);
  }

  const [rows] = await db.query(
    `SELECT
      r.report_id,
      r.item_id,
      r.reported_by,
      r.reason,
      r.details,
      r.status,
      r.reviewed_by,
      r.reviewed_at,
      r.created_at,
      i.title AS item_title,
      i.type AS item_type,
      i.status AS item_status,
      i.moderation_status,
      owner.userId AS owner_user_id,
      owner.fullName AS owner_name,
      reporter.fullName AS reported_by_name,
      reviewer.fullName AS reviewed_by_name
     FROM item_reports r
     LEFT JOIN items i ON i.item_id = r.item_id
     LEFT JOIN users owner ON owner.userId = i.user_id
     LEFT JOIN users reporter ON reporter.userId = r.reported_by
     LEFT JOIN users reviewer ON reviewer.userId = r.reviewed_by
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY r.created_at DESC`,
    params
  );

  return rows;
};

export const reviewReportByAdmin = async ({ reportId, status, reviewedBy }) => {
  await db.query(
    `UPDATE item_reports
     SET status = ?, reviewed_by = ?, reviewed_at = NOW()
     WHERE report_id = ?`,
    [status, reviewedBy, reportId]
  );
};

export const buildDashboardPdf = async () => {
  const stats = await getDashboardStats();
  const reports = await listReportsForAdmin({ status: "pending" });

  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(22).text("UBT FindPoint Admin Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(11).fillColor("#555555").text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    const overviewRows = [
      ["Total users", stats.totalUsers],
      ["Blocked users", stats.blockedUsers],
      ["Total items", stats.totalItems],
      ["Approved items", stats.approvedItems],
      ["Pending items", stats.pendingItems],
      ["Reported items", stats.totalReports],
      ["Pending reports", stats.pendingReports],
    ];

    doc.fillColor("#111111").fontSize(16).text("Overview");
    doc.moveDown(0.5);
    overviewRows.forEach(([label, value]) => {
      doc.fontSize(11).text(`${label}: ${value}`);
    });

    doc.moveDown();
    doc.fontSize(16).text("Recent Activity");
    doc.moveDown(0.5);
    stats.recentActivity.slice(0, 10).forEach((activity) => {
      doc.fontSize(10).text(
        `${new Date(activity.created_at).toLocaleString()} - ${activity.admin_name || "Admin"} ${activity.action_type} ${activity.action_target} ${activity.target_id || ""}`.trim()
      );
    });

    doc.moveDown();
    doc.fontSize(16).text("Pending Reports");
    doc.moveDown(0.5);
    if (!reports.length) {
      doc.fontSize(10).text("No pending reports.");
    } else {
      reports.slice(0, 20).forEach((report) => {
        doc.fontSize(10).text(
          `#${report.report_id} | Item: ${report.item_title || "Unknown"} | Reason: ${report.reason} | Reporter: ${report.reported_by_name || "Unknown"}`
        );
        if (report.details) {
          doc.fontSize(9).fillColor("#555555").text(`Details: ${report.details}`);
          doc.fillColor("#111111");
        }
        doc.moveDown(0.3);
      });
    }

    doc.end();
  });
};
