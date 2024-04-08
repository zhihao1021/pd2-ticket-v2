import {
    ReactElement
} from "react";
import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import TicketListPage from "./list";
import TicketContentPage from "./content";

import "./index.scss";

export default function TicketPage(): ReactElement {
    return <div id="ticket" className="page">
        <Routes>
            <Route path="/:userId" element={<TicketListPage />} />
            <Route path="/:userId/:ticketId/:part?/*" element={<TicketContentPage />} />
            <Route path="*" element={<Navigate to="@me" />} />
        </Routes>
    </div>;
};
