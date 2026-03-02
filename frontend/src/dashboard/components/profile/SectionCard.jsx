import React from "react";

const SectionCard = ({ icon: Icon, title, subtitle, action, children, noPad }) => (
    <div className="bp-section">
        <div className="bp-section__header">
            <div className="bp-section__header-left">
                {Icon && (
                    <div className="bp-section__icon">
                        <Icon style={{ width: 16, height: 16 }} />
                    </div>
                )}
                <div>
                    <h3 className="bp-section__title">{title}</h3>
                    {subtitle && <p className="bp-section__subtitle">{subtitle}</p>}
                </div>
            </div>
            {action && <div>{action}</div>}
        </div>
        <div className={noPad ? "bp-section__body--no-pad" : "bp-section__body"}>
            {children}
        </div>
    </div>
);

export default SectionCard;
