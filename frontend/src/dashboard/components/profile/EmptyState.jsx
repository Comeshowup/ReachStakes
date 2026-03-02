import React from "react";

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
    <div className="bp-empty" role="status">
        {Icon && (
            <div className="bp-empty__icon">
                <Icon style={{ width: 24, height: 24 }} />
            </div>
        )}
        <h4 className="bp-empty__title">{title}</h4>
        {description && <p className="bp-empty__text">{description}</p>}
        {actionLabel && onAction && (
            <button className="bp-empty__cta" onClick={onAction} type="button">
                {actionLabel}
            </button>
        )}
    </div>
);

export default EmptyState;
