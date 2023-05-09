import { useState } from "react";
import { createPortal } from "react-dom";
import Dialog from "@/components/dialog/Dialog";
import ReducedMotion from "@/assets/ReducedMotion";

export default function Footer() {
    const [showSettings, setShowSettings] = useState(false);

    function openDialog() {
        setShowSettings(true);
    }

    function closeDialog() {
        setShowSettings(false);
    }

    return (
        <>
            <footer className="page-footer">
                <div className="footer-row">
                    <div className="footer-column-center">© {new Date().getFullYear()} No Rights Reserved</div>
                    <div className="footer-column-right">
                        <div className="footer-icons">
                            <ul className="footer-icons-list">
                                <li className="footer-icons-item">
                                    <button onClick={openDialog}>
                                        <div className="footer-icon">
                                            <ReducedMotion />
                                        </div>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
            { showSettings ? createPortal(<Dialog onClose={closeDialog} />, document.getElementById("settings-container")) : null }
        </>
    );
}
