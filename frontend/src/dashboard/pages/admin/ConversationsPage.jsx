import React from "react";
import { MessageSquare } from "lucide-react";

/**
 * ConversationsPage — replaces AdminInboxPage
 * Path: /admin/operations/conversations
 *
 * The existing AdminInboxPage UI is fully featured; this component re-exports
 * it so we can keep the rich inbox UX under the new route without duplication.
 * If AdminInboxPage is ever removed, replace the import below with inline UI.
 */
import AdminInboxPage from "./AdminInboxPage";

const ConversationsPage = () => <AdminInboxPage />;

export default ConversationsPage;
