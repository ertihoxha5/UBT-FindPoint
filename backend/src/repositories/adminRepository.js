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

  const [[notificationTotals]] = await db.query(
    `SELECT
      COUNT(*) AS totalAdminNotifications,
      SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) AS unreadAdminNotifications
     FROM notifications
     WHERE audience = 'admin'`
  );

  return {
    ...userTotals,
    ...itemTotals,
    ...reportTotals,
    ...notificationTotals,
    itemsByDay,
    usersByDay,
    recentActivity,
  };
};

export const getPublicDashboardStats = async () => {
  const [[itemTotals]] = await db.query(
    `SELECT
      SUM(CASE WHEN moderation_status = 'approved' THEN 1 ELSE 0 END) AS totalItems,
      SUM(CASE WHEN moderation_status = 'approved' AND type = 'lost' THEN 1 ELSE 0 END) AS totalLost,
      SUM(CASE WHEN moderation_status = 'approved' AND type = 'found' THEN 1 ELSE 0 END) AS totalFound,
      SUM(CASE WHEN moderation_status = 'approved' AND status = 'resolved' THEN 1 ELSE 0 END) AS resolvedItems
     FROM items`
  );

  const [[userTotals]] = await db.query(
    `SELECT
      SUM(CASE WHEN isBlocked = 0 THEN 1 ELSE 0 END) AS activeUsers
     FROM users`
  );

  const totalItems = Number(itemTotals?.totalItems || 0);
  const resolvedItems = Number(itemTotals?.resolvedItems || 0);

  return {
    totalItems,
    totalLost: Number(itemTotals?.totalLost || 0),
    totalFound: Number(itemTotals?.totalFound || 0),
    resolvedItems,
    activeUsers: Number(userTotals?.activeUsers || 0),
    recoveryRate: totalItems > 0 ? Math.round((resolvedItems / totalItems) * 100) : 0,
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
    const doc = new PDFDocument({ margin: 34, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const colors = {
      navy: "#112f52",
      blue: "#2563eb",
      sky: "#dbeafe",
      text: "#10233f",
      muted: "#64748b",
      border: "#dbe7f3",
      soft: "#f8fbff",
      green: "#16a34a",
      amber: "#d97706",
      red: "#dc2626",
      violet: "#7c3aed",
    };

    const drawSectionHeader = (title, subtitle, y) => {
      doc.fillColor(colors.text).font("Helvetica-Bold").fontSize(15).text(title, 34, y);
      if (subtitle) {
        doc.fillColor(colors.muted).font("Helvetica").fontSize(9).text(subtitle, 34, y + 18, {
          width: pageWidth - 68,
        });
      }
      return y + (subtitle ? 34 : 22);
    };

    const drawMetricCard = (x, y, width, label, value, accent) => {
      doc.roundedRect(x, y, width, 58, 12).fillAndStroke(colors.soft, colors.border);
      doc.roundedRect(x, y, 6, 58, 12).fill(accent);
      doc.fillColor(colors.muted).font("Helvetica-Bold").fontSize(8).text(label.toUpperCase(), x + 16, y + 12, {
        width: width - 22,
      });
      doc.fillColor(colors.text).font("Helvetica-Bold").fontSize(18).text(String(value ?? 0), x + 16, y + 28, {
        width: width - 22,
      });
    };

    const drawPill = (x, y, label, value, accent) => {
      const pillWidth = 146;
      doc.roundedRect(x, y, pillWidth, 30, 15).fillAndStroke("#ffffff", colors.border);
      doc.roundedRect(x, y, 30, 30, 15).fill(accent);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10).text(String(value ?? 0), x, y + 10, {
        width: 30,
        align: "center",
      });
      doc.fillColor(colors.muted).font("Helvetica-Bold").fontSize(8).text(label, x + 38, y + 10, {
        width: pillWidth - 46,
      });
    };

    doc.rect(0, 0, pageWidth, 118).fill(colors.navy);
    doc.fillColor("#ffffff").fontSize(23).font("Helvetica-Bold").text("UBT FindPoint Admin Report", 34, 34);
    doc.fontSize(10).font("Helvetica").fillColor(colors.sky).text(`Generated: ${new Date().toLocaleString()}`, 34, 68);
    doc.fillColor("#dbeafe").fontSize(9).text("A concise operational snapshot for platform moderation and review.", 34, 86);

    doc.roundedRect(pageWidth - 162, 28, 128, 58, 14).fillAndStroke("rgba(255,255,255,0.12)", "rgba(255,255,255,0.18)");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10).text("Overview", pageWidth - 146, 40);
    doc.fillColor("#dbeafe").font("Helvetica").fontSize(8).text("Last updated now", pageWidth - 146, 56);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(16).text(String(stats.totalItems ?? 0), pageWidth - 146, 66);

    let y = 130;

    const summaryCards = [
      { label: "Total users", value: stats.totalUsers, accent: colors.blue },
      { label: "Blocked users", value: stats.blockedUsers, accent: colors.red },
      { label: "Total items", value: stats.totalItems, accent: colors.green },
      { label: "Pending reports", value: stats.pendingReports, accent: colors.amber },
    ];

    const cardWidth = (pageWidth - 100) / 4;
    summaryCards.forEach((card, index) => {
      const x = 34 + index * (cardWidth + 8);
      drawMetricCard(x, y, cardWidth, card.label, card.value, card.accent);
    });

    y += 78;
    y = drawSectionHeader("Operations snapshot", "High level moderation counts and notification status.", y);
    drawPill(34, y, "Approved items", stats.approvedItems, colors.green);
    drawPill(192, y, "Pending items", stats.pendingItems, colors.amber);
    drawPill(350, y, "Reported items", stats.totalReports, colors.red);
    drawPill(508, y, "Unread notifications", stats.unreadAdminNotifications, colors.violet);
    y += 42;

    doc.roundedRect(34, y, pageWidth - 68, 1, 0).fill(colors.border);
    y += 16;

    y = drawSectionHeader("Recent activity", "The latest administrative actions performed in the system.", y);
    const activityRows = stats.recentActivity.slice(0, 8);
    if (!activityRows.length) {
      doc.fillColor(colors.muted).font("Helvetica").fontSize(10).text("No recent admin activity yet.", 42, y);
      y += 16;
    } else {
      activityRows.forEach((activity, index) => {
        const rowHeight = 24;
        if (y + rowHeight > pageHeight - 80) {
          doc.addPage();
          y = 40;
          y = drawSectionHeader("Recent activity", "The latest administrative actions performed in the system.", y);
        }

        doc.roundedRect(34, y, pageWidth - 68, rowHeight, 8).fillAndStroke(index % 2 === 0 ? "#ffffff" : "#f8fbff", colors.border);
        doc.fillColor(colors.text).font("Helvetica-Bold").fontSize(9).text(
          `${activity.admin_name || "Admin"} ${activity.action_type} ${activity.action_target}`,
          46,
          y + 7,
          { width: pageWidth - 120 }
        );
        doc.fillColor(colors.muted).font("Helvetica").fontSize(8).text(
          `${new Date(activity.created_at).toLocaleString()}${activity.target_id ? ` • #${activity.target_id}` : ""}`,
          pageWidth - 150,
          y + 7,
          { width: 104, align: "right" }
        );
        y += rowHeight + 6;
      });
    }

    y += 4;
    y = drawSectionHeader("Pending reports", "Items that still need attention from the admin team.", y);
    if (!reports.length) {
      doc.roundedRect(34, y, pageWidth - 68, 34, 10).fillAndStroke("#ffffff", colors.border);
      doc.fillColor(colors.muted).font("Helvetica").fontSize(10).text("No pending reports.", 46, y + 11);
    } else {
      reports.slice(0, 12).forEach((report, index) => {
        const blockHeight = report.details ? 44 : 34;
        if (y + blockHeight > pageHeight - 70) {
          doc.addPage();
          y = 40;
          y = drawSectionHeader("Pending reports", "Items that still need attention from the admin team.", y);
        }

        doc.roundedRect(34, y, pageWidth - 68, blockHeight, 10).fillAndStroke(index % 2 === 0 ? "#ffffff" : "#f8fbff", colors.border);
        doc.roundedRect(34, y, 8, blockHeight, 10).fill(colors.amber);
        doc.fillColor(colors.text).fontSize(9).font("Helvetica-Bold").text(`#${report.report_id}  ${report.item_title || "Unknown item"}`, 50, y + 8, {
          width: pageWidth - 120,
        });
        doc.fontSize(8).font("Helvetica").fillColor(colors.muted).text(
          `Reason: ${report.reason} | Reporter: ${report.reported_by_name || "Unknown"}`,
          50,
          y + 20,
          { width: pageWidth - 120 }
        );
        if (report.details) {
          doc.fillColor(colors.muted).fontSize(8).text(`Details: ${report.details}`, 50, y + 30, {
            width: pageWidth - 120,
            ellipsis: true,
          });
        }
        y += blockHeight + 8;
      });
    }

    doc.fillColor(colors.muted).fontSize(8).font("Helvetica").text(
      "Generated from the UBT FindPoint admin dashboard. This report summarizes the current moderation state and recent administrative activity.",
      34,
      pageHeight - 48,
      { width: pageWidth - 68, align: "center" }
    );

    doc.end();
  });
};
